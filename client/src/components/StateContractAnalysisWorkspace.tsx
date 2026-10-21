import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Network,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const readAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("The source workbook could not be read."));
    reader.readAsDataURL(file);
  });

const statusStyle: Record<
  string,
  { background: string; color: string; border: string }
> = {
  "Source Relationship Present": {
    background: "#f0fdf4",
    color: "#166534",
    border: "#86efac",
  },
  "Review Required": {
    background: "#fffbeb",
    color: "#92400e",
    border: "#fde68a",
  },
  Open: { background: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  Reference: { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};

function StatusPill({ value }: { value: string }) {
  const style = statusStyle[value] ?? statusStyle.Reference;
  return (
    <span
      style={{
        display: "inline-block",
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 999,
        padding: "2px 7px",
        fontSize: 10,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

export default function StateContractAnalysisWorkspace() {
  const utils = trpc.useUtils();
  const { data: artifacts = [], isLoading: artifactsLoading } =
    trpc.dataMapping.listArtifacts.useQuery();
  const [file, setFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState("");
  const [selectedArtifactId, setSelectedArtifactId] = useState<number | null>(
    null
  );
  const [analysisArtifactId, setAnalysisArtifactId] = useState<number | null>(
    null
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const upload = trpc.dataMapping.uploadArtifact.useMutation({
    onSuccess: data => {
      setFile(null);
      setVersionLabel("");
      setSelectedArtifactId(data.artifact.id);
      setAnalysisArtifactId(data.artifact.id);
      setNotice(
        `Uploaded ${data.artifact.fileName}. The source is preserved and ready for an evidence-bound review.`
      );
      setError("");
      void utils.dataMapping.listArtifacts.invalidate();
    },
    onError: uploadError => setError(uploadError.message),
  });
  const analysisQuery = trpc.dataMapping.analyzeStateContract.useQuery(
    { artifactId: analysisArtifactId ?? 0 },
    { enabled: analysisArtifactId !== null, retry: 1 }
  );
  const exportQuery = trpc.dataMapping.exportStateContractAnalysis.useQuery(
    { artifactId: analysisArtifactId ?? 0 },
    { enabled: false }
  );

  const contractArtifacts = useMemo(
    () =>
      artifacts.filter(
        artifact =>
          /\.(xlsx|xls|csv)$/i.test(artifact.fileName) &&
          (artifact.artifactType === "Other" ||
            /state|contract|taxonomy|reference/i.test(artifact.fileName))
      ),
    [artifacts]
  );
  const analysis = analysisQuery.data;

  const uploadSource = async () => {
    if (!file || !versionLabel.trim()) {
      setError(
        "Select an Excel or CSV source and provide the version or source date before upload."
      );
      return;
    }
    setError("");
    try {
      await upload.mutateAsync({
        artifactType: "Other",
        fileName: file.name,
        versionLabel: versionLabel.trim(),
        mimeType:
          file.type ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileBase64: await readAsBase64(file),
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The source workbook could not be uploaded."
      );
    }
  };

  const runAnalysis = () => {
    if (!selectedArtifactId) {
      setError("Select a governed source workbook before running an analysis.");
      return;
    }
    setError("");
    setAnalysisArtifactId(selectedArtifactId);
    void analysisQuery.refetch();
  };

  const downloadWorkbook = async () => {
    const result = await exportQuery.refetch();
    if (!result.data) return;
    const bytes = Uint8Array.from(atob(result.data.fileBase64), character =>
      character.charCodeAt(0)
    );
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-labelledby="state-contract-analysis-title"
      style={{
        background: "#fff",
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,#0f766e,#1e3a5f)",
          color: "#fff",
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          <FileSpreadsheet size={20} /> State Contract Mapping & Dependency
          Review
        </div>
        <p
          id="state-contract-analysis-title"
          style={{
            margin: "5px 0 0",
            fontSize: 12,
            opacity: 0.9,
            lineHeight: 1.5,
          }}
        >
          Upload a structured State, TDC, Process, or IMS workbook to create a
          separate mapping-review spreadsheet and surface evidence-bound gaps
          and cross-team dependencies from MVP through Pilot knowledge.
        </p>
      </div>

      <div style={{ padding: 14 }}>
        <div
          style={{
            background: "#eff6ff",
            borderLeft: "4px solid #1e3a5f",
            borderRadius: 7,
            padding: "9px 11px",
            color: "#1e3a5f",
            fontSize: 11,
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          <ShieldCheck
            size={14}
            style={{ verticalAlign: "-2px", marginRight: 5 }}
          />
          <strong>Governance boundary:</strong> Buddy preserves the uploaded
          source and produces a separate review artifact. A source relationship,
          candidate gap, or cross-team dependency is not an approved mapping,
          contract, interface, story commitment, or implementation decision.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 9,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                color: "#1e3a5f",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <Upload size={15} /> 1. Upload a source attachment
            </div>
            <p
              style={{
                margin: "5px 0 9px",
                color: "#64748b",
                fontSize: 11,
                lineHeight: 1.45,
              }}
            >
              Excel and CSV only. Use the version/date to preserve source
              traceability. The original source is never overwritten.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={event => setFile(event.target.files?.[0] ?? null)}
              style={{ width: "100%", fontSize: 11 }}
            />
            <input
              value={versionLabel}
              onChange={event => setVersionLabel(event.target.value)}
              placeholder="Source version or date"
              style={{
                boxSizing: "border-box",
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "7px 8px",
                fontSize: 12,
                marginTop: 8,
              }}
            />
            {file && (
              <div style={{ marginTop: 6, fontSize: 10, color: "#475569" }}>
                Selected: <strong>{file.name}</strong> ·{" "}
                {(file.size / 1024).toFixed(0)} KB
              </div>
            )}
            <button
              onClick={uploadSource}
              disabled={upload.isPending}
              style={{
                marginTop: 9,
                width: "100%",
                border: "none",
                borderRadius: 6,
                padding: "8px 10px",
                background: upload.isPending ? "#94a3b8" : "#0f766e",
                color: "#fff",
                cursor: upload.isPending ? "not-allowed" : "pointer",
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              {upload.isPending
                ? "Preserving source…"
                : "Upload governed source"}
            </button>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 9,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                color: "#1e3a5f",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <Network size={15} /> 2. Build the review workbook
            </div>
            <p
              style={{
                margin: "5px 0 9px",
                color: "#64748b",
                fontSize: 11,
                lineHeight: 1.45,
              }}
            >
              Select an uploaded contract, analyze gaps and workstream
              dependencies, then download the Excel review package.
            </p>
            <select
              value={selectedArtifactId ?? ""}
              onChange={event =>
                setSelectedArtifactId(Number(event.target.value) || null)
              }
              style={{
                boxSizing: "border-box",
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "7px 8px",
                fontSize: 11,
              }}
            >
              <option value="">
                {artifactsLoading
                  ? "Loading sources…"
                  : "Select uploaded source"}
              </option>
              {contractArtifacts.map(artifact => (
                <option key={artifact.id} value={artifact.id}>
                  {artifact.fileName} · {artifact.versionLabel}
                </option>
              ))}
            </select>
            <button
              onClick={runAnalysis}
              disabled={analysisQuery.isFetching}
              style={{
                marginTop: 9,
                width: "100%",
                border: "none",
                borderRadius: 6,
                padding: "8px 10px",
                background: analysisQuery.isFetching ? "#94a3b8" : "#1e3a5f",
                color: "#fff",
                cursor: analysisQuery.isFetching ? "not-allowed" : "pointer",
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              {analysisQuery.isFetching
                ? "Analyzing source…"
                : "Analyze mapping gaps & dependencies"}
            </button>
          </div>
        </div>

        {notice && (
          <div
            style={{
              marginTop: 10,
              color: "#047857",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 6,
              padding: "7px 9px",
              fontSize: 11,
            }}
          >
            {notice}
          </div>
        )}
        {error && (
          <div
            role="alert"
            style={{
              marginTop: 10,
              color: "#991b1b",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "7px 9px",
              fontSize: 11,
            }}
          >
            <AlertTriangle
              size={13}
              style={{ verticalAlign: "-2px", marginRight: 5 }}
            />
            {error}
          </div>
        )}
        {analysisQuery.isError && (
          <div
            role="alert"
            style={{
              marginTop: 10,
              color: "#991b1b",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "7px 9px",
              fontSize: 11,
            }}
          >
            The source review could not be completed. Confirm that the file is a
            structured Excel or CSV workbook and try again.
          </div>
        )}

        {analysis && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-end",
                marginBottom: 9,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{ color: "#1e293b", fontWeight: 800, fontSize: 13 }}
                >
                  Source review: {analysis.source.fileName}
                </div>
                <div style={{ color: "#64748b", fontSize: 10, marginTop: 3 }}>
                  Version: {analysis.source.versionLabel} · Generated analysis
                  is review-only and is grounded in captured source rows plus
                  registered Pilot evidence.
                </div>
              </div>
              <button
                onClick={downloadWorkbook}
                disabled={exportQuery.isFetching}
                style={{
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 10px",
                  background: exportQuery.isFetching ? "#94a3b8" : "#0f766e",
                  color: "#fff",
                  cursor: exportQuery.isFetching ? "not-allowed" : "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <Download
                  size={13}
                  style={{ verticalAlign: "-2px", marginRight: 5 }}
                />
                {exportQuery.isFetching
                  ? "Preparing workbook…"
                  : "Download mapping review (.xlsx)"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,minmax(0,1fr))",
                gap: 7,
                marginBottom: 12,
              }}
            >
              {[
                ["State input rows", analysis.source.inputRows, "#1e3a5f"],
                [
                  "Field-contract rows",
                  analysis.source.fieldContractRows,
                  "#1e3a5f",
                ],
                [
                  "Validation rules",
                  analysis.source.validationRules,
                  "#047857",
                ],
                [
                  "Open-question rows",
                  analysis.source.openQuestions,
                  "#92400e",
                ],
                [
                  "TCC relationships present",
                  analysis.source.populatedTccPatterns,
                  "#047857",
                ],
                [
                  "TCC review needed",
                  analysis.source.unclassifiedTccPatterns,
                  "#b45309",
                ],
              ].map(([label, value, color]) => (
                <div
                  key={String(label)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 7,
                    padding: "8px 9px",
                  }}
                >
                  <div
                    style={{
                      color: String(color),
                      fontSize: 17,
                      fontWeight: 800,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{ color: "#64748b", fontSize: 9, lineHeight: 1.25 }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 9,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "9px 10px",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#1e293b",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  Priority gaps requiring review
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      minWidth: 620,
                      fontSize: 10,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#fff" }}>
                        {["Area", "Finding", "Teams", "Status"].map(heading => (
                          <th
                            key={heading}
                            style={{
                              textAlign: "left",
                              padding: "7px 8px",
                              color: "#64748b",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.gaps.map(gap => (
                        <tr
                          key={gap.id}
                          style={{
                            verticalAlign: "top",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <td
                            style={{
                              padding: 8,
                              fontWeight: 700,
                              color: "#1e293b",
                              minWidth: 120,
                            }}
                          >
                            {gap.area}
                            <div
                              style={{
                                color: "#64748b",
                                fontWeight: 500,
                                marginTop: 3,
                              }}
                            >
                              {gap.id}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: 8,
                              color: "#475569",
                              lineHeight: 1.4,
                            }}
                          >
                            {gap.finding}
                            <div style={{ marginTop: 4, color: "#1e3a5f" }}>
                              <strong>Next:</strong> {gap.nextAction}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: 8,
                              color: "#475569",
                              minWidth: 110,
                            }}
                          >
                            {gap.accountableTeams}
                          </td>
                          <td style={{ padding: 8 }}>
                            <StatusPill value={gap.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 9,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "9px 10px",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#1e293b",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  Cross-team dependency review
                </div>
                <div style={{ padding: 10, display: "grid", gap: 8 }}>
                  {analysis.dependencies.map(dependency => (
                    <div
                      key={dependency.dependency}
                      style={{
                        borderLeft: "3px solid #0f766e",
                        paddingLeft: 8,
                      }}
                    >
                      <div
                        style={{
                          color: "#1e293b",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {dependency.dependency}
                      </div>
                      <div
                        style={{ color: "#0f766e", fontSize: 10, marginTop: 2 }}
                      >
                        {dependency.workstream} · {dependency.status}
                      </div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 10,
                          lineHeight: 1.4,
                          marginTop: 3,
                        }}
                      >
                        {dependency.evidence}
                      </div>
                      <div
                        style={{
                          color: "#1e3a5f",
                          fontSize: 10,
                          lineHeight: 1.4,
                          marginTop: 3,
                        }}
                      >
                        <strong>Next:</strong> {dependency.nextAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 9,
                overflow: "hidden",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "9px 10px",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#1e293b",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                State Rule Input mapping review
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    minWidth: 1020,
                    fontSize: 10,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fff" }}>
                      {[
                        "Rule Input",
                        "Input Name",
                        "TCC Pattern",
                        "Tax Year",
                        "Status",
                        "Gap / review action",
                      ].map(heading => (
                        <th
                          key={heading}
                          style={{
                            textAlign: "left",
                            padding: "7px 8px",
                            color: "#64748b",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.mappingRows.slice(0, 25).map(row => (
                      <tr
                        key={row.sourceRow}
                        style={{
                          verticalAlign: "top",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <td
                          style={{
                            padding: 8,
                            color: "#1e293b",
                            fontWeight: 800,
                          }}
                        >
                          {row.ruleInput}
                          <div
                            style={{
                              color: "#64748b",
                              fontWeight: 500,
                              marginTop: 3,
                            }}
                          >
                            {row.ruleCode} · {row.sourceRow}
                          </div>
                        </td>
                        <td style={{ padding: 8, color: "#475569" }}>
                          {row.inputName}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            color:
                              row.tccPattern === "Not identified"
                                ? "#b45309"
                                : "#047857",
                            fontFamily: "monospace",
                          }}
                        >
                          {row.tccPattern}
                        </td>
                        <td style={{ padding: 8, color: "#475569" }}>
                          {row.taxYear}
                        </td>
                        <td style={{ padding: 8 }}>
                          <StatusPill value={row.mappingStatus} />
                        </td>
                        <td
                          style={{
                            padding: 8,
                            color: "#475569",
                            lineHeight: 1.4,
                            maxWidth: 350,
                          }}
                        >
                          {row.gap}
                          <div style={{ color: "#1e3a5f", marginTop: 4 }}>
                            <strong>Next:</strong> {row.nextAction}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {analysis.mappingRows.length > 25 && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                    padding: "7px 9px",
                    color: "#64748b",
                    fontSize: 10,
                  }}
                >
                  Showing the first 25 source rows. Download the mapping review
                  workbook for the complete table and source-summary tabs.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
