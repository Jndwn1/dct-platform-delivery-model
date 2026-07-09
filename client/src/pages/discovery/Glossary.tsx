import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


interface GlossaryTerm {
  term: string;
  category: string;
  categoryColor: string;
  definition: string;
  context?: string;
  relatedTerms?: string[];
}

const TERMS: GlossaryTerm[] = [
  {
    term: "PDC",
    category: "Platform",
    categoryColor: "#1e3a5f",
    definition: "Phoenix Data Consolidation (PDC). A sub-system of DCT. The financial truth layer of the DCT ecosystem. PDC ingests raw financial data from client ERP systems, normalizes it against a canonical model, assigns entities and reporting periods, and produces the authoritative financial record consumed by TDC.",
    context: "PDC does NOT apply tax logic. It owns financial data normalization only.",
    relatedTerms: ["TDC", "Canonical Model", "Entity", "Reporting Period", "Financial Truth"],
  },
  {
    term: "TDC",
    category: "Platform",
    categoryColor: "#065f46",
    definition: "Tax Data Consolidation (TDC). A sub-system of DCT (Data Consolidation Team). The tax transformation platform that receives normalized financial data from PDC and applies tax rules, mappings, adjustments, and classifications to produce tax-ready data. TDC is the system of record for all tax data.",
    context: "TDC owns all business rules, tax logic, and data persistence. All Roger stories trace back to a TDC API or business object.",
    relatedTerms: ["PDC", "Roger", "Known Mapping", "Tax Adjustment", "Lineage", "Tax Ready Data"],
  },
  {
    term: "Roger",
    category: "Platform",
    categoryColor: "#7c3aed",
    definition: "The tax professional workspace — a practitioner-facing UI that consumes TDC data via governed APIs. Roger allows tax professionals to review, edit, approve, and resolve exceptions on tax data. Roger is NOT the system of record and does NOT persist data independently.",
    context: "Roger owns the user experience. TDC owns the data. All changes made in Roger are sent back to TDC via Update APIs.",
    relatedTerms: ["TDC", "Roger Read API", "Roger Update API", "Practitioner"],
  },
  {
    term: "IMS (Integration & Management System)",
    category: "Platform",
    categoryColor: "#92400e",
    definition: "IMS is the integration broker between DCT/Roger and all downstream return engines (GoSystem, CCH, OIT). IMS retrieves governed tax-ready data from TDC via the B9A Gateway, translates the payload, and routes it to the correct return engine. DCT does not connect directly to any return engine.",
    context: "IMS owns all engine routing, payload translation, and delivery. GoSystem, CCH, and OIT are downstream consumers of IMS — not direct consumers of DCT.",
    relatedTerms: ["TDC", "Tax Ready Data", "Federal Return", "State Return"],
  },
  {
    term: "Entity",
    category: "Data",
    categoryColor: "#0369a1",
    definition: "A legal or organizational unit within a client's structure — such as a corporation, partnership, or LLC. PDC assigns entity identifiers to all financial records. TDC uses entity context to apply the correct tax rules and state requirements.",
    relatedTerms: ["PDC", "Reporting Period", "Canonical Model"],
  },
  {
    term: "Reporting Period",
    category: "Data",
    categoryColor: "#0369a1",
    definition: "The fiscal year and period to which financial data belongs. PDC assigns reporting periods to all ingested records. Reporting periods determine which tax rules, rates, and forms apply to the data.",
    relatedTerms: ["Entity", "PDC", "TDC"],
  },
  {
    term: "Known Mapping",
    category: "Tax",
    categoryColor: "#065f46",
    definition: "A pre-configured, system-level mapping that automatically classifies a financial account to a tax line. Known mappings are maintained in TDC and applied during the tax transformation pipeline without requiring practitioner review.",
    context: "Known mappings reduce manual review burden. Accounts not covered by known mappings require practitioner classification in Roger.",
    relatedTerms: ["TDC", "Tax Adjustment", "Book vs Tax", "Classification"],
  },
  {
    term: "Tax Adjustment",
    category: "Tax",
    categoryColor: "#065f46",
    definition: "A modification to financial data for tax purposes — such as depreciation adjustments, deferred tax items, or book-to-tax differences. Tax adjustments can be system-generated (by TDC rules) or practitioner-created (via Roger).",
    relatedTerms: ["TDC", "Roger", "Book vs Tax", "Known Mapping"],
  },
  {
    term: "Book vs Tax",
    category: "Tax",
    categoryColor: "#065f46",
    definition: "The difference between how an item is recorded for financial (book) accounting purposes versus how it is treated for tax purposes. TDC classifies items as book or tax and tracks book-to-tax differences as part of the tax transformation pipeline.",
    relatedTerms: ["TDC", "Tax Adjustment", "Known Mapping", "Reclassification"],
  },
  {
    term: "Provision",
    category: "Tax",
    categoryColor: "#065f46",
    definition: "Tax provision — the estimated amount of income tax a company expects to pay for the current period. TDC supports provision calculations as part of the tax transformation pipeline, applying provision-specific rules and schedules.",
    relatedTerms: ["TDC", "Tax Ready Data", "IMS (Integration & Management System)"],
  },
  {
    term: "State",
    category: "Tax",
    categoryColor: "#065f46",
    definition: "State tax — tax obligations imposed by individual US states. TDC applies state-specific tax rules, apportionment factors, and NOL (Net Operating Loss) calculations for each applicable jurisdiction.",
    relatedTerms: ["TDC", "IMS (Integration & Management System)", "Provision"],
  },
  {
    term: "Lineage",
    category: "Governance",
    categoryColor: "#dc2626",
    definition: "Data lineage — the complete audit trail of how data was created, transformed, and changed throughout the DCT pipeline. TDC maintains lineage records for every data change, capturing who changed what, when, and why. Lineage is immutable and cannot be deleted.",
    context: "Lineage is a governance requirement. Every TDC data change must update the lineage record.",
    relatedTerms: ["TDC", "Audit", "Persistence"],
  },
  {
    term: "Canonical Model",
    category: "Data",
    categoryColor: "#0369a1",
    definition: "The standardized, normalized data model used by PDC to represent financial data consistently across all clients, LOBs (Lines of Business), and source systems. The canonical model eliminates source-system-specific formats and ensures all downstream systems receive data in a consistent structure.",
    relatedTerms: ["PDC", "Entity", "Normalization"],
  },
  {
    term: "Financial Truth",
    category: "Data",
    categoryColor: "#1e3a5f",
    definition: "The authoritative, normalized financial record produced by PDC after ingestion, normalization, entity assignment, and reporting period assignment. Financial Truth is the canonical representation of a client's financial data — the single source of truth for all downstream tax processing.",
    relatedTerms: ["PDC", "Canonical Model", "TDC"],
  },
  {
    term: "Tax Ready Data",
    category: "Data",
    categoryColor: "#065f46",
    definition: "The fully transformed, tax-classified, and practitioner-approved data produced by TDC. Tax-ready data has been through the complete tax transformation pipeline — rules, mappings, adjustments, classifications, and practitioner review — and is ready for delivery via IMS to downstream return engines (GoSystem, CCH, OIT). TDC delivers tax-ready data as a flat, IRS-form-structured payload to IMS; IMS performs translation, roll-up, and engine-specific shaping before writing to the return engine.",
    relatedTerms: ["TDC", "IMS (Integration & Management System)", "Lineage", "Financial Truth"],
  },
];

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const categories = Array.from(new Set(TERMS.map(t => t.category)));

  const filtered = TERMS.filter(t => {
    const matchesSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>≡</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Glossary</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          Authoritative definitions for all DCT platform terms. Use this as your reference when writing requirements, stories, or architecture documents.
        </p>
      </div>

      {/* Search and filter */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms and definitions..."
          style={{
            flex: 1, minWidth: "200px", padding: "8px 14px", borderRadius: "6px",
            border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f1623",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
              backgroundColor: !selectedCategory ? "#1e3a5f" : "#f1f5f9",
              color: !selectedCategory ? "white" : "#475569",
              fontSize: "11px", fontWeight: 600,
            }}
          >
            All ({TERMS.length})
          </button>
          {categories.map(cat => {
            const color = TERMS.find(t => t.category === cat)?.categoryColor ?? "#475569";
            const count = TERMS.filter(t => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                style={{
                  padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                  backgroundColor: selectedCategory === cat ? color : "#f1f5f9",
                  color: selectedCategory === cat ? "white" : "#475569",
                  fontSize: "11px", fontWeight: 600,
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "16px" }}>
        {filtered.length} term{filtered.length !== 1 ? "s" : ""} {search || selectedCategory ? "found" : "total"}
      </div>

      {/* Terms list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(term => {
          const isExpanded = expandedTerm === term.term;
          return (
            <div
              key={term.term}
              style={{
                backgroundColor: "white",
                border: `1px solid ${isExpanded ? term.categoryColor : "#e2e8f0"}`,
                borderRadius: "10px", overflow: "hidden",
                transition: "border-color 0.2s",
                borderLeft: `3px solid ${term.categoryColor}`,
              }}
            >
              <button
                onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                style={{
                  width: "100%", padding: "14px 18px", background: "none", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                  textAlign: "left",
                }}
              >
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f1623", minWidth: "120px" }}>
                    {term.term}
                  </div>
                  {!isExpanded && (
                    <div style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {term.definition.substring(0, 80)}...
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
                  backgroundColor: `${term.categoryColor}15`, color: term.categoryColor,
                  fontWeight: 700, flexShrink: 0,
                }}>
                  {term.category}
                </span>
                <span style={{ fontSize: "12px", color: "#94a3b8", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f1f5f9" }}>
                  <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7", marginTop: "12px", marginBottom: "0" }}>
                    {term.definition}
                  </p>

                  {term.context && (
                    <div style={{
                      marginTop: "12px", padding: "10px 14px",
                      backgroundColor: "#fffbeb", borderRadius: "8px",
                      border: "1px solid #fde68a",
                      display: "flex", alignItems: "flex-start", gap: "8px",
                    }}>
                      <span style={{ color: "#d97706", fontSize: "12px", flexShrink: 0 }}>⚠</span>
                      <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.5" }}>{term.context}</div>
                    </div>
                  )}

                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                        Related Terms
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {term.relatedTerms.map(rt => (
                          <button
                            key={rt}
                            onClick={(e) => { e.stopPropagation(); setExpandedTerm(rt); setSearch(""); setSelectedCategory(null); }}
                            style={{
                              fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                              backgroundColor: "#f1f5f9", color: "#475569",
                              border: "1px solid #e2e8f0", cursor: "pointer", fontWeight: 500,
                            }}
                          >
                            {rt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>
          No terms found for "{search}". Try a different search term.
        </div>
      )}
      <DiscoveryAskBuddy pagePath="/discovery/glossary" pageTitle="Glossary" />
    </div>
  );
}
