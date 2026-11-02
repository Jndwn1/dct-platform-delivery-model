/**
 * Build-time only. Run: pnpm tsx scripts/buildBuddyPageIndex.ts
 * Parses authored client sources; never imports/executes them or queries a service.
 * No timestamps: identical input produces byte-identical server-only JSON.
 */
import ts from "typescript";
import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const INDEX_LIMITS = {
  dependencyDepth: 4,
  filesPerPage: 24,
  sourceBytes: 512_000,
  blocksPerPage: 180,
  textCharsPerPage: 24_000,
  blockChars: 1_100,
  indexBytes: 4_000_000,
} as const;

export interface AuthoredBlock {
  text: string;
  sourceFile: string;
  section: string;
  kind: "jsx" | "label" | "data";
  boundary: boolean;
}
export interface AuthoredPage {
  path: string;
  canonicalPath: string;
  title: string;
  aliases: string[];
  component: string;
  blocks: AuthoredBlock[];
  sourceFiles: string[];
  coverage: {
    kind: "bounded-static-authored-content";
    routeMapped: boolean;
    redirectTo?: string;
    routeProps: Record<string, string>;
    filesVisited: number;
    blocksExtracted: number;
    blocksIncluded: number;
    unresolvedExpressions: number;
    skippedDependencies: number;
    truncated: boolean;
    notIncluded: string[];
  };
}
export interface BuddyPageIndex {
  schemaVersion: 1;
  authority: string;
  limits: typeof INDEX_LIMITS;
  routeSource: string;
  pages: AuthoredPage[];
}
interface RouteRecord {
  path: string;
  component: string;
  source?: string;
  redirectTo?: string;
  props: Record<string, string>;
}
const QUALIFIER = /\b(proposed|demonstrat\w*|planning|reference|dummy|unverified|not validated|not completed|not live|does not|do not|never|no values|not inferred|not supplied|pending confirmation|source of truth|boundary|qualifier|illustrat\w*|intended|snapshot|unresolved)\b/i;
const UNSAFE_NAME = /(?:secret|password|passwd|credential|authorization|accessToken|refreshToken|apiKey|privateKey|clientSecret|connectionString|databaseUrl|^env$|^config$|^settings$|endpoint|url$|href$|image$|src$)/i;
const TECHNICAL_KEY = /^(?:style|className|css|color|bg|background\w*|border\w*|accent\w*|surface|ink|font\w*|padding\w*|margin\w*|width|height|size|variant|icon|Icon|component|on\w+|key|path|route|sectionId|rootNodeId|testId|align\w*|display|position|opacity|gap|grid\w*|flex\w*|transition|cursor|zIndex|transform|overflow\w*)$/;
const TEXT_KEY = /(?:title|label|description|desc$|detail|summary|note|boundary|purpose|why|outcome|name$|source$|status|state$|evidence|assessment|finding|goal|objective|scope|requirement|rule|bullet|phase|step|audience|visibility|owner|assignedTo|workstream|team|date|period|sprint|count|total|completed|carried|rate|amount|value|number|id$|pi$|area$|commitment|dependencies|feature|story|action|decision|risk|question|answer|support|text|caption|message|milestone)/i;
const JSX_TEXT_ATTR = /^(?:title|pageTitle|label|aria-label|ariaLabel|alt|placeholder|description|desc|detail|summary|eyebrow|heading|sub|supportNote|outcome|note|caption|text|message|boundary)$/;
const BLOCK_TAG = /^(?:div|section|main|article|ul|ol|li|table|thead|tbody|tr|td|th|p|h[1-6]|Card|CardContent|CardHeader)$/;
const INLINE_TAG = /^(?:span|strong|em|b|i|small|a|Link|br|code)$/;
const clean = (text: string) => text.replace(/&amp;/g, "&").replace(/&nbsp;|&#160;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim();
const humanize = (name: string) => clean(name.replace(/([a-z\d])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " "));
const readable = (text: string) => {
  const value = clean(text);
  // External/storage URLs, secrets and markup/code are not readable evidence.
  if (!value || /(?:https?:\/\/|data:|blob:|www\.|\/manus-storage\/|BEGIN .*PRIVATE KEY|\b(?:sk|pk)_(?:live|test)_|Bearer\s+[A-Za-z0-9._-]{15}|(?:password|secret|api[_ -]?key)\s*[:=]\s*\S+|import\.meta\.env|process\.env)/i.test(value)) return "";
  if (/^(?:#[\da-f]{3,8}|\d+(?:px|rem|em|vh|vw|%)|rgba?\(.+|https?:.*|\/[\w/:.-]+|[A-Za-z]+\/[A-Za-z.+-]+)$/.test(value)) return "";
  if (/^(?:GET|POST|PUT|DELETE|PATCH)\s+\//.test(value)) return "";
  if (/[{}]|=>|\b(?:const|let)\s+\w+\s*=/.test(value)) return "";
  if (!/[\p{L}\p{N}]/u.test(value)) return "";
  return value;
};
function literal(node: ts.Node | undefined): string | undefined {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isJsxExpression(node) && node.expression) return literal(node.expression);
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeAssertionExpression(node)) return literal(node.expression);
  return undefined;
}
function unwrap(node: ts.Expression): ts.Expression {
  return ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node) || ts.isTypeAssertionExpression(node) ? unwrap(node.expression) : node;
}
function propertyName(node: ts.PropertyName): string {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node) ? node.text : "";
}
function walk(node: ts.Node, visit: (node: ts.Node) => void) {
  visit(node);
  ts.forEachChild(node, child => walk(child, visit));
}
function attr(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, name: string) {
  return node.attributes.properties.find((item): item is ts.JsxAttribute => ts.isJsxAttribute(item) && item.name.getText() === name);
}

export function buildBuddyPageIndex(projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")): BuddyPageIndex {
  const root = realpathSync(projectRoot);
  const clientRoot = path.join(root, "client/src");
  const relative = (file: string) => path.relative(root, file).split(path.sep).join("/");
  const cache = new Map<string, ts.SourceFile>();
  function allowed(file: string) {
    const rel = relative(file);
    return /^client\/src\/(?:pages|components|lib)\/.*\.(?:ts|tsx)$/.test(rel)
      && !/(?:^|\/)(?:node_modules|ui|assets)(?:\/|$)|\.(?:test|spec|d)\.ts$/.test(rel)
      && !/(?:^|\/)(?:env|config|settings|const|trpc|utils|pageContextRegistry|DiscoveryAskBuddy|RelatedObjectsPanel|Sidebar|Header|AIChatBox|ErrorBoundary)\.(?:ts|tsx)$/i.test(rel)
      && !/^client\/src\/lib\/askBuddy.*\.(?:ts|tsx)$/i.test(rel);
  }
  function resolveLocal(from: string, specifier: string): string | undefined {
    let target: string;
    if (specifier.startsWith("@/")) target = path.join(clientRoot, specifier.slice(2));
    else if (specifier.startsWith(".")) target = path.resolve(path.dirname(from), specifier);
    else return undefined;
    for (const candidate of [target, `${target}.tsx`, `${target}.ts`, path.join(target, "index.tsx"), path.join(target, "index.ts")]) {
      if (!existsSync(candidate) || !statSync(candidate).isFile()) continue;
      const real = realpathSync(candidate);
      if (allowed(real)) return real;
    }
    return undefined;
  }
  function parse(file: string): ts.SourceFile {
    const cached = cache.get(file);
    if (cached) return cached;
    if (statSync(file).size > INDEX_LIMITS.sourceBytes) throw new Error(`Source exceeds AST budget: ${relative(file)}`);
    const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    if ((sf as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics.length) throw new Error(`Cannot parse ${relative(file)}`);
    cache.set(file, sf);
    return sf;
  }
  const appFile = path.join(clientRoot, "App.tsx");
  const app = parse(appFile);
  const imports = new Map<string, string>();
  for (const statement of app.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) && !statement.importClause?.isTypeOnly) {
      const file = resolveLocal(appFile, statement.moduleSpecifier.text);
      if (file && statement.importClause?.name) imports.set(statement.importClause.name.text, file);
    }
  }
  walk(app, node => {
    if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) || !node.initializer) return;
    walk(node.initializer, child => {
      if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const specifier = literal(child.arguments[0]);
        const file = specifier && resolveLocal(appFile, specifier);
        if (file) imports.set(node.name.getText(), file);
      }
    });
  });
  const routes: RouteRecord[] = [];
  walk(app, node => {
    if (!(ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) || node.tagName.getText() !== "Route") return;
    const routePath = literal(attr(node, "path")?.initializer);
    if (!routePath) return; // The pathless 404 fallback is not an authored App path.
    const componentAttr = attr(node, "component");
    const expression = componentAttr?.initializer && ts.isJsxExpression(componentAttr.initializer) ? componentAttr.initializer.expression : undefined;
    let component = "";
    let redirectTo: string | undefined;
    const props: Record<string, string> = {};
    if (expression) walk(expression, child => {
      if (ts.isIdentifier(child) && imports.has(child.text) && !component) component = child.text;
      if (ts.isJsxSelfClosingElement(child) || ts.isJsxOpeningElement(child)) {
        if (imports.has(child.tagName.getText())) {
          component = child.tagName.getText();
          for (const item of child.attributes.properties) if (ts.isJsxAttribute(item)) {
            const value = literal(item.initializer);
            if (value !== undefined && !UNSAFE_NAME.test(item.name.getText())) props[item.name.getText()] = value;
          }
        }
      }
      if (ts.isCallExpression(child) && ts.isPropertyAccessExpression(child.expression) && child.expression.getText() === "window.location.replace") redirectTo = literal(child.arguments[0]);
    });
    routes.push({ path: routePath, component, source: imports.get(component), redirectTo, props });
  });
  if (new Set(routes.map(route => route.path)).size !== routes.length) throw new Error("Duplicate App route paths");
  function resolveRoute(route: RouteRecord, seen = new Set<string>()): RouteRecord {
    if (!route.redirectTo) return route;
    if (seen.has(route.path)) throw new Error(`Redirect cycle at ${route.path}`);
    seen.add(route.path);
    const target = routes.find(item => item.path === route.redirectTo);
    if (!target) throw new Error(`Unmapped redirect ${route.path}`);
    return resolveRoute(target, seen);
  }
  // Read only exact-route metadata titles; never mix other pages' registry content.
  const metadataTitles = new Map<string, string[]>();
  const registryFile = path.join(clientRoot, "lib/pageContextRegistry.ts");
  if (existsSync(registryFile)) walk(parse(registryFile), node => {
    if (!ts.isPropertyAssignment(node) || !propertyName(node.name).startsWith("/")) return;
    const value = unwrap(node.initializer);
    if (!ts.isObjectLiteralExpression(value)) return;
    for (const item of value.properties) if (ts.isPropertyAssignment(item) && propertyName(item.name) === "pageTitle") {
      const title = literal(item.initializer);
      if (title && readable(title)) metadataTitles.set(propertyName(node.name), [clean(title)]);
    }
  });

  function extract(route: RouteRecord) {
    const blocks: AuthoredBlock[] = [];
    const sources: string[] = [];
    let unresolved = 0;
    let skipped = 0;
    let traversalTruncated = false;
    const headingTitles: string[] = [];
    const routeTitles: string[] = [];
    const seenBlocks = new Set<string>();
    function add(text: string, file: string, section: string, kind: AuthoredBlock["kind"]) {
      const value = readable(text);
      if (!value || value === "[dynamic value not included]") return;
      const key = `${relative(file)}:${section}:${value}`;
      if (seenBlocks.has(key)) return;
      seenBlocks.add(key);
      // Whole authored fields only; don't cut a sentence away from its qualifier.
      if (value.length > INDEX_LIMITS.blockChars) { traversalTruncated = true; return; }
      blocks.push({ text: value, sourceFile: relative(file), section: clean(section).slice(0, 200), kind, boundary: QUALIFIER.test(value) });
    }
    function renderInline(node: ts.Node): string {
      if (ts.isJsxText(node)) return clean(node.text);
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return readable(node.text);
      if (ts.isNumericLiteral(node)) return node.text; // Exact authored literal, not a computed metric.
      if (ts.isJsxExpression(node)) return node.expression ? renderInline(node.expression) : "";
      if (ts.isJsxElement(node)) return node.children.map(renderInline).filter(Boolean).join(" ");
      if (ts.isJsxFragment(node)) return node.children.map(renderInline).filter(Boolean).join(" ");
      if (ts.isTemplateExpression(node)) {
        const chunks = [node.head.text, ...node.templateSpans.flatMap(span => ["[dynamic value not included]", span.literal.text])];
        return clean(chunks.join(" "));
      }
      if (ts.isConditionalExpression(node)) {
        const branches = [renderInline(node.whenTrue), renderInline(node.whenFalse)].filter(text => text && text !== "[dynamic value not included]");
        return branches.length ? `[conditional authored alternatives; visibility not evaluated] ${branches.join(" | ")}` : "[dynamic value not included]";
      }
      if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) return renderInline(node.expression);
      return "[dynamic value not included]";
    }
    function scalar(node: ts.Expression): string | undefined {
      node = unwrap(node);
      const text = literal(node);
      if (text !== undefined) return readable(text) || undefined;
      if (ts.isNumericLiteral(node)) return node.text;
      if (node.kind === ts.SyntaxKind.TrueKeyword) return "true";
      if (node.kind === ts.SyntaxKind.FalseKeyword) return "false";
      if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return `-${node.operand.text}`;
      return undefined;
    }
    function data(node: ts.Expression, file: string, section: string, inherited = "", depth = 0) {
      node = unwrap(node);
      if (depth > 8) { traversalTruncated = true; return; }
      if (ts.isArrayLiteralExpression(node)) {
        const values = node.elements.map(item => ts.isSpreadElement(item) ? undefined : scalar(item));
        if (values.every(value => value !== undefined)) {
          const fields = values as string[];
          let chunk: string[] = [];
          for (const field of fields) {
            if ((`${inherited} ${chunk.join(" | ")} | ${field}`).length > INDEX_LIMITS.blockChars - 10) {
              add(`${inherited}${chunk.join(" | ")}`, file, section, "data"); chunk = [];
            }
            chunk.push(field);
          }
          if (chunk.length) add(`${inherited}${chunk.join(" | ")}`, file, section, "data");
        } else for (const item of node.elements) if (!ts.isSpreadElement(item)) data(item, file, section, inherited, depth + 1);
        return;
      }
      if (!ts.isObjectLiteralExpression(node)) return;
      const fields = node.properties.filter((item): item is ts.PropertyAssignment => ts.isPropertyAssignment(item));
      // A literal route prop selects a corresponding authored collection entry.
      if (route.props.workspaceId && /Operating Model Workspaces/i.test(section)) {
        const id = fields.find(item => propertyName(item.name) === "id");
        if (id && scalar(id.initializer) !== route.props.workspaceId) return;
        const title = fields.find(item => propertyName(item.name) === "title");
        if (id && title) { const text = scalar(title.initializer); if (text) routeTitles.push(text); }
      }
      const own: string[] = [];
      const nested: { key: string; expression: ts.Expression }[] = [];
      for (const field of fields) {
        const key = propertyName(field.name);
        if (!key || UNSAFE_NAME.test(key) || TECHNICAL_KEY.test(key)) continue;
        const value = unwrap(field.initializer);
        if (ts.isObjectLiteralExpression(value) || ts.isArrayLiteralExpression(value)) {
          if (ts.isArrayLiteralExpression(value) && value.elements.every(item => !ts.isSpreadElement(item) && scalar(item) !== undefined) && TEXT_KEY.test(key)) {
            own.push(`${humanize(key)}: ${value.elements.map(item => scalar(item as ts.Expression)).join(" | ")}`);
          } else nested.push({ key, expression: value });
        } else if (TEXT_KEY.test(key)) {
          const text = scalar(value);
          if (text !== undefined) own.push(`${humanize(key)}: ${text}`);
          // Do not render JS identifiers, interpolation or calculated numbers as evidence.
        }
      }
      const identifiers = own.filter(field => /^(?:id|title|name|label|sprint|number|pi|source|planning Status|status|state|boundary|evidence|scope):/i.test(field));
      const qualifierFields = own.filter(field => QUALIFIER.test(field));
      const prefix = [...new Set([...identifiers.slice(0, 3), ...qualifierFields])].join("; ");
      let chunk: string[] = [];
      for (const field of own) {
        if (`${inherited}${chunk.join("; ")}; ${field}`.length > INDEX_LIMITS.blockChars) {
          add(`${inherited}${chunk.join("; ")}`, file, section, "data"); chunk = [];
        }
        chunk.push(field);
      }
      if (chunk.length) add(`${inherited}${chunk.join("; ")}`, file, section, "data");
      const context = clean(`${inherited}${prefix ? `${prefix}. ` : ""}`);
      const boundedContext = context.length < 350 ? `${context}${context ? " " : ""}` : inherited;
      for (const child of nested) data(child.expression, file, `${section} / ${humanize(child.key)}`, boundedContext, depth + 1);
    }
    function visitSource(file: string, depth: number) {
      const rel = relative(file);
      sources.push(rel);
      const sf = parse(file);
      let section = humanize(path.basename(file).replace(/\.(?:tsx|ts)$/, ""));
      function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isTypeNode(node) || ts.isInterfaceDeclaration(node)) return;
        // Never collect messages from logging, configuration, transport or mutation calls.
        if (ts.isCallExpression(node) && /^(?:console\.|logger\.|toast\.|fetch$|localStorage\.|sessionStorage\.)/.test(node.expression.getText())) return;
        if (ts.isPropertyAssignment(node) && (UNSAFE_NAME.test(propertyName(node.name)) || TECHNICAL_KEY.test(propertyName(node.name)))) return;
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
          const name = node.name.text;
          if (UNSAFE_NAME.test(name)) return;
          const value = unwrap(node.initializer);
          if (ts.isObjectLiteralExpression(value) || ts.isArrayLiteralExpression(value)) {
            data(value, file, humanize(name));
            // JSX in authored data still needs extraction; literals already handled above.
          } else if (/(?:note|title|caption|description|boundary|summary|notice|message|label|text|milestone|source)/i.test(name)) {
            const text = literal(value); if (text) add(text, file, humanize(name), "data");
          }
        }
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const labels: string[] = [];
          for (const item of node.attributes.properties) if (ts.isJsxAttribute(item) && JSX_TEXT_ATTR.test(item.name.getText())) {
            const value = literal(item.initializer);
            if (value && readable(value)) labels.push(`${humanize(item.name.getText())}: ${clean(value)}`);
          }
          if (labels.length) add(labels.join("; "), file, section, "label");
          // Only semantic text attributes; no CSS, event handlers, URLs or configuration.
          return;
        }
        if (ts.isJsxExpression(node) && node.expression && literal(node.expression) === undefined && !ts.isNumericLiteral(node.expression)) unresolved++;
        if (ts.isJsxElement(node)) {
          const tag = node.openingElement.tagName.getText();
          const heading = /^(?:h[1-6]|CardTitle)$/.test(tag);
          const hasLiteral = node.children.some(child => ts.isJsxText(child) && !!readable(child.text));
          const inline = node.children.every(child => !(ts.isJsxElement(child) && !INLINE_TAG.test(child.openingElement.tagName.getText())) && !ts.isJsxFragment(child));
          if (heading || (hasLiteral && inline)) {
            const text = renderInline(node);
            if (heading && text && !text.includes("[dynamic")) {
              section = clean(text);
              if (tag === "h1" && file === route.source) headingTitles.push(section);
            }
            add(text, file, section, "jsx");
            visit(node.openingElement);
            // Count unresolved values even when the inline block is consumed.
            for (const child of node.children) walk(child, part => {
              if (ts.isJsxExpression(part) && part.expression && literal(part.expression) === undefined && !ts.isNumericLiteral(part.expression)) unresolved++;
            });
            return;
          }
        }
        if (ts.isJsxText(node)) { add(node.text, file, section, "jsx"); return; }
        // Inline arrays used by JSX .map are authored business rows, not live records.
        if (ts.isArrayLiteralExpression(node) && ts.isPropertyAccessExpression(node.parent) && node.parent.name.text === "map") data(node, file, section);
        ts.forEachChild(node, visit);
      }
      visit(sf);
      const dependencies = new Set<string>();
      for (const statement of sf.statements) {
        if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        if (ts.isImportDeclaration(statement) && (statement.importClause?.isTypeOnly || (statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings) && statement.importClause.namedBindings.elements.every(item => item.isTypeOnly)))) continue;
        const target = resolveLocal(file, statement.moduleSpecifier.text);
        if (target) dependencies.add(target);
        else skipped++;
      }
      return [...dependencies].sort().map(target => ({ file: target, depth: depth + 1 }));
    }
    const queue = route.source ? [{ file: route.source, depth: 0 }] : [];
    const visited = new Set<string>();
    while (queue.length) {
      const item = queue.shift()!;
      if (visited.has(item.file)) continue;
      if (item.depth > INDEX_LIMITS.dependencyDepth || sources.length >= INDEX_LIMITS.filesPerPage) { traversalTruncated = true; skipped++; continue; }
      visited.add(item.file);
      queue.push(...visitSource(item.file, item.depth));
    }
    // Fair, deterministic distribution over all traversed sources, reserving boundaries.
    const selected = new Set<AuthoredBlock>();
    let textChars = 0;
    const take = (block: AuthoredBlock) => {
      if (selected.has(block)) return;
      if (selected.size >= INDEX_LIMITS.blocksPerPage || textChars + block.text.length > INDEX_LIMITS.textCharsPerPage) return;
      selected.add(block); textChars += block.text.length;
    };
    const buckets = sources.map(source => blocks.filter(block => block.sourceFile === source));
    // First few qualifiers from each source guard against a small helper losing its boundary.
    for (const bucket of buckets) bucket.filter(block => block.boundary).sort((a, b) => {
      const important = (block: AuthoredBlock) => /not (?:completed|validated|demonstrated|live)|does not|do not|no (?:values|automated|validated)|never|pending confirmation|boundary:|PROPOSED TARGET/i.test(block.text) ? 1 : 0;
      return important(b) - important(a);
    }).slice(0, 10).forEach(take);
    for (let i = 0; i < Math.max(0, ...buckets.map(bucket => bucket.length)); i++) for (const bucket of buckets) if (bucket[i]) take(bucket[i]);
    return {
      blocks: blocks.filter(block => selected.has(block)),
      sourceFiles: sources,
      headingTitles,
      routeTitles,
      unresolved,
      skipped,
      totalBlocks: blocks.length,
      truncated: traversalTruncated || selected.size < blocks.length,
    };
  }
  const extracted = new Map<string, ReturnType<typeof extract>>();
  const canonical = new Map<string, string>();
  const pages = routes.map(route => {
    const target = resolveRoute(route);
    if (!target.source) throw new Error(`No client page component mapped for ${route.path}`);
    const identity = `${target.source}:${JSON.stringify(target.props)}`;
    if (!extracted.has(identity)) extracted.set(identity, extract(target));
    if (!canonical.has(identity)) canonical.set(identity, target.path);
    const content = extracted.get(identity)!;
    const registryTitles = metadataTitles.get(target.path) ?? [];
    const title = content.routeTitles[0] ?? content.headingTitles[0] ?? registryTitles[0] ?? humanize(target.component.replace(/Page$/, ""));
    const aliases = [...new Set([title, ...content.headingTitles, ...content.routeTitles, ...registryTitles, ...(metadataTitles.get(route.path) ?? []), humanize(target.component.replace(/Page$/, "")), humanize(route.path.replace(/\/:\w+/g, "").replace(/^\//, "").replace(/\//g, " "))])].filter(Boolean);
    return {
      path: route.path,
      canonicalPath: canonical.get(identity)!,
      title,
      aliases,
      component: target.component,
      blocks: content.blocks,
      sourceFiles: content.sourceFiles,
      coverage: {
        kind: "bounded-static-authored-content" as const,
        routeMapped: true,
        ...(route.redirectTo ? { redirectTo: route.redirectTo } : {}),
        routeProps: target.props,
        filesVisited: content.sourceFiles.length,
        blocksExtracted: content.totalBlocks,
        blocksIncluded: content.blocks.length,
        unresolvedExpressions: content.unresolved,
        skippedDependencies: content.skipped,
        truncated: content.truncated,
        notIncluded: [
          "Live database/API/ADO records, user input, runtime state, computed values and unresolved JSX expressions are not included.",
          "Dynamic route parameters select a page template, not a verified per-record view; conditional/tab visibility is not evaluated.",
          "Secrets, environment/configuration, logs, server files, external URLs, image pixels and package dependencies are not indexed.",
          "Imported contexts/hooks and technical or assistant/navigation widgets are outside this page/component/lib traversal.",
          ...(content.truncated ? ["Traversal/text budgets omit some authored content; route coverage does not mean exhaustive content coverage."] : []),
        ],
      },
    } satisfies AuthoredPage;
  });
  const result: BuddyPageIndex = {
    schemaVersion: 1,
    authority: "Static authored client content at build time only. Not live database or ADO evidence; not a browser visit or external-source verification. Preserve proposed, demonstrated, planning, reference and dummy-data qualifiers. Literal business numbers are copied only; calculations and unresolved values are not included.",
    limits: INDEX_LIMITS,
    routeSource: "client/src/App.tsx",
    pages,
  };
  if (Buffer.byteLength(JSON.stringify(result, null, 2) + "\n") > INDEX_LIMITS.indexBytes) throw new Error("Generated index exceeds server-only size budget");
  return result;
}

export function writeBuddyPageIndex(projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")) {
  const index = buildBuddyPageIndex(projectRoot);
  const output = path.join(projectRoot, "server/platformPageEvidence.generated.json");
  writeFileSync(output, JSON.stringify(index, null, 2) + "\n", "utf8");
  return { output, routes: index.pages.length, bytes: statSync(output).size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = writeBuddyPageIndex();
  console.log(`Buddy authored page index: ${result.routes} routes, ${result.bytes} bytes -> ${result.output}`);
}
