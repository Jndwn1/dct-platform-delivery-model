import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Search, ShieldCheck, Upload, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

type FilterStatus = "All" | "Confirmed" | "Candidate" | "Ambiguous" | "No Match" | "Conflict" | "Missing Input Code" | "Missing Rule Code";

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Confirmed: { bg: "#dcfce7", text: "#166534" },
  Candidate: { bg: "#fef9c3", text: "#854d0e" },
  Ambiguous: { bg: "#ffedd5", text: "#9a3412" },
  "No Match": { bg: "#fee2e2", text: "#991b1b" },
  Conflict: { bg: "#fce7f3", text: "#9d174d" },
};

const readAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error("The artifact could not be read."));
  reader.readAsDataURL(file);
});

function ArtifactUploader({ artifactType, onSaved }: { artifactType: "Master Data" | "Prior Year Inventory" | "Approved Crosswalk"; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState("");
  const [error, setError] = useState("");
  const upload = trpc.dataMapping.uploadArtifact.useMutation({ onSuccess: () => { setFile(null); setVersionLabel(""); setError(""); onSaved(); } });
  const submit = async () => {
    if (!file || !versionLabel.trim()) { setError("Select an artifact and enter its version/date before upload."); return; }
    try {
      const fileBase64 = await readAsBase64(file);
      await upload.mutateAsync({ artifactType, fileName: file.name, versionLabel: versionLabel.trim(), mimeType: file.type || "application/octet-stream", fileBase64 });
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
  };
  return <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#1e3a5f", fontWeight: 800, fontSize: 13 }}><FileSpreadsheet size={16} /> {artifactType}</div>
    <p style={{ fontSize: 11, color: "#64748b", margin: "5px 0 10px" }}>Excel or CSV only. Original source values are preserved; mapping output is created separately.</p>
    <input type="file" accept=".xlsx,.xls,.csv" onChange={event => setFile(event.target.files?.[0] ?? null)} style={{ fontSize: 11, width: "100%" }} />
    <input value={versionLabel} onChange={event => setVersionLabel(event.target.value)} placeholder="Artifact version or date" style={{ boxSizing: "border-box", width: "100%", border: "1px solid #cbd5e1", borderRadius: 6, padding: "7px 8px", fontSize: 12, marginTop: 8 }} />
    {file && <div style={{ marginTop: 7, fontSize: 11, color: "#475569" }}>Selected: <strong>{file.name}</strong> · {(file.size / 1024).toFixed(0)} KB</div>}
    {error && <div style={{ color: "#b91c1c", fontSize: 11, marginTop: 7 }}>{error}</div>}
    <button onClick={submit} disabled={upload.isPending} style={{ marginTop: 9, width: "100%", border: "none", borderRadius: 6, padding: "8px 10px", background: upload.isPending ? "#94a3b8" : "#0f766e", color: "#fff", cursor: upload.isPending ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700 }}>{upload.isPending ? "Reading artifact…" : <><Upload size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />Add governed artifact</>}</button>
  </div>;
}

export default function DataMappingWorkspace() {
  const utils = trpc.useUtils();
  const { data: artifacts = [], isLoading: artifactsLoading } = trpc.dataMapping.listArtifacts.useQuery();
  const [masterArtifactId, setMasterArtifactId] = useState<number | null>(null);
  const [priorArtifactId, setPriorArtifactId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const createSession = trpc.dataMapping.createSession.useMutation({ onSuccess: (data) => { setSessionId(data.session.id); setNotice(`Mapping review created. Readiness: ${data.readiness.readiness}.`); } });
  const sessionQuery = trpc.dataMapping.getSession.useQuery({ sessionId: sessionId ?? 0 }, { enabled: sessionId !== null });
  const exportQuery = trpc.dataMapping.exportSession.useQuery({ sessionId: sessionId ?? 0 }, { enabled: false });
  const review = trpc.dataMapping.reviewResult.useMutation({ onSuccess: () => { if (sessionId) utils.dataMapping.getSession.invalidate({ sessionId }); setNotice("Review action recorded with the selected mapping evidence."); } });
  const masterArtifacts = artifacts.filter(artifact => artifact.artifactType === "Master Data");
  const priorArtifacts = artifacts.filter(artifact => artifact.artifactType === "Prior Year Inventory");
  const session = sessionQuery.data;
  const results = session?.results ?? [];
  const filtered = useMemo(() => results.filter(result => {
    const haystack = `${result.originalMasterField} ${result.priorInventoryField ?? ""} ${result.inputCode} ${result.ruleCode}`.toLowerCase();
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (filter === "Missing Input Code") return result.inputCode === "Not Confirmed";
    if (filter === "Missing Rule Code") return result.ruleCode === "Not Confirmed";
    return filter === "All" || result.status === filter;
  }), [results, filter, search]);
  const counts = useMemo(() => results.reduce<Record<string, number>>((acc, result) => ({ ...acc, [result.status]: (acc[result.status] ?? 0) + 1 }), {}), [results]);
  const startMapping = async () => {
    if (!masterArtifactId || !priorArtifactId) { setNotice("Select one Master Data artifact and one Prior Year Inventory artifact first."); return; }
    await createSession.mutateAsync({ masterArtifactId, priorArtifactId });
  };
  const download = async () => {
    const result = await exportQuery.refetch();
    if (!result.data) return;
    const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = result.data.fileName; anchor.click(); URL.revokeObjectURL(url);
  };
  const updateArtifacts = () => utils.dataMapping.listArtifacts.invalidate();

  return <div style={{ minWidth: 0 }}>
    <div style={{ background: "linear-gradient(135deg,#0f766e,#1e3a5f)", color: "#fff", borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 16 }}><ShieldCheck size={20} /> Data Mapping Assistant</div>
      <div style={{ fontSize: 12, opacity: .86, marginTop: 5 }}>Evidence-based field mapping for DCT Discovery. Buddy never invents an Input Code; semantic similarity creates a Candidate only.</div>
    </div>
    <div style={{ background: "#eff6ff", borderLeft: "4px solid #1e3a5f", borderRadius: 7, padding: "9px 12px", color: "#1e3a5f", fontSize: 12, marginBottom: 12 }}><strong>Implemented mapping precedence:</strong> approved crosswalk → Master Data Input Code → Prior Year Inventory Input Code → BA-confirmed historical mapping → semantic candidate. Taxonomy/data-dictionary and registered API sources are not yet registered in this workspace and are not used to create mappings.</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
      <ArtifactUploader artifactType="Master Data" onSaved={updateArtifacts} />
      <ArtifactUploader artifactType="Prior Year Inventory" onSaved={updateArtifacts} />
      <ArtifactUploader artifactType="Approved Crosswalk" onSaved={updateArtifacts} />
    </div>
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 12 }}>
      <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 13, marginBottom: 8 }}>1. Select governed source versions</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Master Data source<select value={masterArtifactId ?? ""} onChange={event => setMasterArtifactId(Number(event.target.value) || null)} style={{ boxSizing: "border-box", display: "block", width: "100%", marginTop: 4, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}><option value="">Select uploaded/current artifact</option>{masterArtifacts.map(artifact => <option key={artifact.id} value={artifact.id}>{artifact.fileName} · {artifact.versionLabel}</option>)}</select></label>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Prior Year Inventory source<select value={priorArtifactId ?? ""} onChange={event => setPriorArtifactId(Number(event.target.value) || null)} style={{ boxSizing: "border-box", display: "block", width: "100%", marginTop: 4, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}><option value="">Select uploaded/current artifact</option>{priorArtifacts.map(artifact => <option key={artifact.id} value={artifact.id}>{artifact.fileName} · {artifact.versionLabel}</option>)}</select></label>
      </div>
      {!artifactsLoading && !artifacts.length && <div style={{ marginTop: 9, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: 8, fontSize: 11 }}><AlertTriangle size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />No registered structured DCT Master Data or Prior Year artifact is available yet. Upload the authoritative source versions; they will be retained for governed reuse.</div>}
      <button onClick={startMapping} disabled={createSession.isPending} style={{ marginTop: 11, border: "none", borderRadius: 6, padding: "9px 13px", background: createSession.isPending ? "#94a3b8" : "#1e3a5f", color: "#fff", fontWeight: 700, fontSize: 12, cursor: createSession.isPending ? "not-allowed" : "pointer" }}>{createSession.isPending ? "Comparing governed artifacts…" : "Map Input Codes"}</button>
      {notice && <span style={{ marginLeft: 10, fontSize: 11, color: notice.includes("NOT READY") || notice.includes("newer") ? "#92400e" : "#047857" }}>{notice}</span>}
    </div>
    {session && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginBottom: 12 }}>
        <div style={{ background: session.sourceGovernance?.masterAuthority?.startsWith("Sample") ? "#fffbeb" : "#f0fdf4", border: `1px solid ${session.sourceGovernance?.masterAuthority?.startsWith("Sample") ? "#fde68a" : "#86efac"}`, borderRadius: 8, padding: 9, fontSize: 11, color: session.sourceGovernance?.masterAuthority?.startsWith("Sample") ? "#92400e" : "#047857" }}><strong>Master Data authority</strong><br />{session.sourceGovernance?.masterAuthority ?? "Not assessed"}</div>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 9, fontSize: 11, color: "#475569" }}><strong style={{ color: "#1e293b" }}>Approved crosswalk</strong><br />{session.sourceGovernance?.approvedCrosswalk ?? "Not registered"}</div>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 9, fontSize: 11, color: "#475569" }}><strong style={{ color: "#1e293b" }}>Historical confirmed mappings</strong><br />{session.sourceGovernance?.historicalConfirmedCount ?? 0} available for reuse</div>
        <div style={{ background: session.sourceGovernance?.staleSelections?.length ? "#fffbeb" : "#f0fdf4", border: `1px solid ${session.sourceGovernance?.staleSelections?.length ? "#fde68a" : "#86efac"}`, borderRadius: 8, padding: 9, fontSize: 11, color: session.sourceGovernance?.staleSelections?.length ? "#92400e" : "#047857" }}><strong>Source freshness</strong><br />{session.sourceGovernance?.staleSelections?.length ? `Newer ${session.sourceGovernance.staleSelections.join(" and ")} artifact available — review before relying on this session.` : "Selected artifacts are the newest registered versions."}</div>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ flex: "1 1 220px", background: session.session.readiness === "READY" ? "#f0fdf4" : "#fffbeb", border: `1px solid ${session.session.readiness === "READY" ? "#86efac" : "#fde68a"}`, borderRadius: 8, padding: 10 }}><div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: ".06em" }}>MAPPING READINESS</div><div style={{ color: session.session.readiness === "READY" ? "#047857" : "#92400e", fontWeight: 800, marginTop: 2 }}>{session.session.readiness}</div><div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>Unresolved candidates, conflicts, missing codes, or duplicate one-to-one mappings keep the result not ready.</div></div>
        {(Object.entries(JSON.parse(session.session.exceptionsJson) as Record<string, number>)).map(([label, count]) => <div key={label} style={{ minWidth: 90, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}><div style={{ fontSize: 17, color: count ? "#b45309" : "#059669", fontWeight: 800 }}>{count}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "capitalize" }}>{label.replace(/([A-Z])/g, " $1")}</div></div>)}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e2e8f0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><strong style={{ color: "#1e293b", fontSize: 13 }}>2. Mapping review</strong><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search field, Input Code, Rule Code…" style={{ marginLeft: "auto", minWidth: 220, border: "1px solid #cbd5e1", borderRadius: 6, padding: "7px 8px", fontSize: 11 }} /><Search size={15} color="#64748b" />{(["All", "Confirmed", "Candidate", "Ambiguous", "No Match", "Conflict", "Missing Input Code", "Missing Rule Code"] as FilterStatus[]).map(value => <button key={value} onClick={() => setFilter(value)} style={{ border: filter === value ? "1px solid #1e3a5f" : "1px solid #e2e8f0", background: filter === value ? "#eff6ff" : "#fff", color: "#334155", borderRadius: 14, padding: "3px 7px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>{value}{counts[value] ? ` (${counts[value]})` : ""}</button>)}</div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 1100 }}><thead><tr style={{ background: "#f8fafc" }}>{["Master Data Field", "Prior Year Inventory Field", "Input Code", "Rule Code", "Match Status", "Confidence", "Evidence & Explanation", "BA Review"].map(header => <th key={header} style={{ textAlign: "left", padding: "8px 9px", color: "#475569", borderBottom: "1px solid #e2e8f0", fontSize: 10 }}>{header}</th>)}</tr></thead><tbody>{filtered.map(result => { const style = STATUS_STYLE[result.status]; const evidence = JSON.parse(result.evidenceJson) as string[]; return <tr key={result.id} style={{ borderBottom: "1px solid #f1f5f9", verticalAlign: "top" }}><td style={{ padding: 9, color: "#1e293b", fontWeight: 700 }}>{result.originalMasterField}</td><td style={{ padding: 9, color: "#475569" }}>{result.priorInventoryField ?? "—"}</td><td style={{ padding: 9, color: result.inputCode === "Not Confirmed" ? "#b91c1c" : "#047857", fontFamily: "monospace", fontWeight: 700 }}>{result.inputCode}</td><td style={{ padding: 9, color: "#475569", fontFamily: "monospace" }}>{result.ruleCode}</td><td style={{ padding: 9 }}><span style={{ background: style.bg, color: style.text, borderRadius: 10, padding: "3px 6px", fontWeight: 800, fontSize: 10 }}>{result.status}</span></td><td style={{ padding: 9, color: "#475569" }}>{result.confidence}%</td><td style={{ padding: 9, color: "#475569", maxWidth: 260 }}><div>{result.reason}</div>{evidence.map(item => <div key={item} style={{ color: "#0f766e", marginTop: 3 }}>• {item}</div>)}</td><td style={{ padding: 9 }}><div style={{ fontSize: 10, color: "#64748b", marginBottom: 5 }}>{result.reviewStatus}</div><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{result.status === "Confirmed" && result.inputCode !== "Not Confirmed" && <button onClick={() => review.mutate({ resultId: result.id, action: "Confirm Mapping" })} style={{ fontSize: 10, border: "1px solid #86efac", background: "#f0fdf4", color: "#166534", borderRadius: 4, padding: "3px 5px", cursor: "pointer" }}>Confirm</button>}<button onClick={() => review.mutate({ resultId: result.id, action: "Needs SME Review" })} style={{ fontSize: 10, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", borderRadius: 4, padding: "3px 5px", cursor: "pointer" }}>Needs SME</button><button onClick={() => review.mutate({ resultId: result.id, action: "Add Discovery Question", reviewNotes: result.reason })} style={{ fontSize: 10, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: 4, padding: "3px 5px", cursor: "pointer" }}>Discovery question</button></div></td></tr>; })}</tbody></table></div>
        <div style={{ padding: 11, borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: "#64748b", fontSize: 11 }}>3. Generate a separate review artifact. It does not overwrite either uploaded source workbook.</span><button onClick={download} style={{ border: "none", background: "#1e3a5f", color: "#fff", borderRadius: 6, padding: "7px 10px", fontWeight: 700, cursor: "pointer", fontSize: 11 }}><Download size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />Download mapping review CSV</button></div>
      </div>
    </>}
  </div>;
}
