import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ExternalLink, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  CLOSEOUT_FILE_ACCEPT, CLOSEOUT_MAX_FILES_PER_SELECTION, CLOSEOUT_SOURCE_CATEGORIES,
  CLOSEOUT_SOURCE_STATUS, validateCloseoutFile, type CloseoutSourceCategory,
} from "@shared/sprintCloseoutSources";

type IntakeState = { loaded: boolean; count: number; categories: string[] };
type Props = { onIntakeState?: (state: IntakeState) => void };
const fieldClass = "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:opacity-60";
const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;
const fileSize = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString(undefined, { maximumFractionDigits: 2 })} MB (${bytes.toLocaleString()} bytes)`;
export const safeCloseoutSourceUrl = (url: string) => /^(https?:\/\/|\/(?!\/))/i.test(url) && !/[\\\u0000-\u0020]/.test(url) ? url : undefined;

export function readCloseoutFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && reader.result.includes(",")
      ? resolve(reader.result.slice(reader.result.indexOf(",") + 1))
      : reject(new Error("Could not read this file."));
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.onabort = () => reject(new Error("File reading was interrupted."));
    reader.readAsDataURL(file);
  });
}

// Each file gets exactly one mutation attempt. Only confirmed successes leave the queue.
export async function transferCloseoutFiles<Row>(files: File[], options: {
  upload: (file: File, base64: string) => Promise<Row>;
  stage: (message: string) => void;
  success: (file: File, row: Row) => void;
  failure: (file: File, message: string) => void;
}) {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    let row: Row;
    try {
      options.stage(`Preparing ${index + 1}/${files.length}: ${file.name}`);
      const base64 = await readCloseoutFileBase64(file);
      options.stage(`Uploading ${index + 1}/${files.length}: ${file.name}`);
      row = await options.upload(file, base64);
    } catch (error) {
      options.failure(file, error instanceof Error ? error.message : "Upload failed. Try again manually.");
      continue;
    }
    options.success(file, row);
  }
}

export function SprintCloseoutUploads({ onIntakeState }: Props) {
  const id = useId();
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<CloseoutSourceCategory | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [succeeded, setSucceeded] = useState({ period: "", names: [] as string[] });
  const oneFlight = useRef(false);
  const utils = trpc.useUtils();
  const reportingPeriod = label.trim().replace(/\s+/g, " ");
  const validPeriod = reportingPeriod.length > 0 && reportingPeriod.length <= 100;
  const input = useMemo(() => ({ reportingPeriod }), [reportingPeriod]);
  const periods = trpc.sprintCloseoutSources.periods.useQuery();
  const list = trpc.sprintCloseoutSources.list.useQuery(input, { enabled: validPeriod, placeholderData: undefined });
  const mutation = trpc.sprintCloseoutSources.upload.useMutation({ retry: false });
  type SourceRow = NonNullable<typeof list.data>[number];
  // Show confirmed new rows even if the first list request is still loading; never call that a complete intake.
  const [registered, setRegistered] = useState<SourceRow[]>([]);
  const rows = useMemo(() => {
    const combined = [...(list.data ?? []), ...registered].filter(row => row.reportingPeriod === reportingPeriod);
    return Array.from(new Map(combined.map(row => [row.id, row])).values());
  }, [list.data, registered, reportingPeriod]);
  const intake = useMemo<IntakeState>(() => {
    const loaded = validPeriod && !list.isLoading && !list.isError && !list.isPlaceholderData && list.data !== undefined
      && list.data.every(row => row.reportingPeriod === reportingPeriod);
    return loaded ? { loaded: true, count: list.data!.length, categories: Array.from(new Set(list.data!.map(row => row.category))) }
      : { loaded: false, count: 0, categories: [] };
  }, [validPeriod, reportingPeriod, list.data, list.isLoading, list.isError, list.isPlaceholderData]);
  useEffect(() => { onIntakeState?.(intake); }, [onIntakeState, intake]);

  function addFiles(incoming: File[]) {
    if (oneFlight.current || !category) return;
    const additions = incoming.filter((file, index) => !files.some(old => fileKey(old) === fileKey(file))
      && incoming.findIndex(other => fileKey(other) === fileKey(file)) === index);
    if (files.length + additions.length > CLOSEOUT_MAX_FILES_PER_SELECTION) {
      setErrors([`Choose at most ${CLOSEOUT_MAX_FILES_PER_SELECTION} files per selection. Remove queued files or select fewer files.`]);
      return;
    }
    const rejected: string[] = [];
    const accepted = additions.filter(file => {
      const error = validateCloseoutFile(file.name, file.size, category);
      if (error) rejected.push(`${file.name}: ${error}`);
      return !error;
    });
    setFiles(old => [...old, ...accepted]);
    setErrors(rejected);
  }

  async function uploadFiles() {
    if (oneFlight.current) return;
    const validation = !validPeriod ? ["Enter a closeout label of 1–100 characters."] : !category ? ["Choose a file category."]
      : !files.length ? ["Choose files to upload."] : files.flatMap(file => {
        const error = validateCloseoutFile(file.name, file.size, category);
        return error ? [`${file.name}: ${error}`] : [];
      });
    if (validation.length) { setErrors(validation); return; }
    const selectedCategory = category as CloseoutSourceCategory;
    oneFlight.current = true;
    setUploading(true);
    setErrors([]);
    setSucceeded({ period: reportingPeriod, names: [] });
    try {
      await transferCloseoutFiles(files, {
        upload: (file, fileBase64) => mutation.mutateAsync({ reportingPeriod, category: selectedCategory, fileName: file.name, fileBase64 }),
        stage: setStage,
        success: (file, row) => {
          setRegistered(old => [...old.filter(item => item.id !== row.id), row]);
          utils.sprintCloseoutSources.list.setData(input, old => old === undefined ? undefined
            : [...old.filter(item => item.id !== row.id), row]);
          setFiles(old => old.filter(item => item !== file));
          setSucceeded(old => ({ period: reportingPeriod, names: [...old.names, file.name] }));
        },
        failure: (file, message) => setErrors(old => [...old, `${file.name}: ${message}`]),
      });
    } finally {
      oneFlight.current = false;
      setUploading(false);
      setStage("");
      void utils.sprintCloseoutSources.list.invalidate(input).catch(() => {});
      void utils.sprintCloseoutSources.periods.invalidate().catch(() => {});
    }
  }

  return (
    <section aria-labelledby={`${id}-title`} className="mb-4 rounded-[10px] border border-slate-200 bg-white p-4 text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:px-[18px]">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700">Source intake · Closeout workspace</div>
      <h2 id={`${id}-title`} className="mb-2 mt-1 flex items-center gap-2 text-base font-black text-slate-900"><Upload size={16} aria-hidden="true" />Upload Closeout Files</h2>
      <p className="mb-3 text-xs leading-relaxed">Upload source evidence only. Uploads do not validate counts or approve a closeout, and do not create deployments or generate or send email.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor={`${id}-label`} className="text-xs font-bold text-slate-900">Closeout label
          <input id={`${id}-label`} className={fieldClass} value={label} maxLength={100} disabled={uploading} placeholder="Enter PI / sprint or a closeout name" onChange={event => setLabel(event.target.value)} />
        </label>
        <label htmlFor={`${id}-period`} className="text-xs font-bold text-slate-900">Or select an existing closeout
          <select id={`${id}-period`} className={fieldClass} disabled={uploading} value={periods.data?.includes(label) ? label : ""} onChange={event => { if (event.target.value) setLabel(event.target.value); }}>
            <option value="">{periods.isLoading ? "Loading existing closeouts…" : "Select existing closeout (optional)"}</option>
            {periods.data?.map(period => <option key={period} value={period}>{period}</option>)}
          </select>
        </label>
      </div>
      {periods.isError && <p role="alert" className="mt-2 text-xs text-red-700">Existing closeouts unavailable. You can still enter a label. <button type="button" className="underline" onClick={() => void periods.refetch()}>Retry closeouts</button></p>}
      <label htmlFor={`${id}-category`} className="mt-3 block text-xs font-bold text-slate-900">File category / source role
        <select id={`${id}-category`} className={fieldClass} value={category} disabled={uploading} onChange={event => setCategory(event.target.value as CloseoutSourceCategory | "")}>
          <option value="">Choose a category</option>
          {CLOSEOUT_SOURCE_CATEGORIES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <div className="mt-3 rounded-md border-2 border-dashed border-emerald-200 bg-emerald-50 p-3 text-xs" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addFiles(Array.from(event.dataTransfer.files)); }}>
        <label htmlFor={`${id}-files`} className="block font-bold text-emerald-800">Choose files or drag and drop here</label>
        <input id={`${id}-files`} type="file" multiple disabled={uploading || !category} accept={category.startsWith("template-") ? ".png" : CLOSEOUT_FILE_ACCEPT} className="mt-2 block w-full text-xs text-slate-700 file:mr-3 file:rounded file:border file:border-emerald-300 file:bg-white file:px-3 file:py-2 file:text-emerald-800" onChange={event => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
        {!category && <p className="mt-2 font-semibold text-emerald-800">Choose a category above to enable file selection and drag/drop.</p>}
        <p className="mt-2">Maximum 10 files per selection; 10 MB each. {category.startsWith("template-") ? "Template categories accept PNG only; upload does not verify template approval." : "PNG, JPG, WebP, PDF, DOCX, XLSX, XLS, CSV, TXT, MD or PPTX. Template categories accept PNG only."}</p>
      </div>
      {files.length > 0 && <ul className="mt-3 space-y-1 text-xs" aria-label="Selected files">
        {files.map(file => <li key={fileKey(file)} className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-2">
          <span className="min-w-0 break-all">{file.name} <span className="text-slate-500">· {fileSize(file.size)}</span>{category && validateCloseoutFile(file.name, file.size, category) && <span className="block text-red-700">{validateCloseoutFile(file.name, file.size, category)}</span>}</span>
          <button type="button" disabled={uploading} className="shrink-0 text-teal-700 underline disabled:opacity-50" aria-label={`Remove ${file.name} from selection`} onClick={() => setFiles(old => old.filter(item => item !== file))}>Remove</button>
        </li>)}
      </ul>}
      <button type="button" disabled={uploading || mutation.isPending || !validPeriod || !category || !files.length} onClick={() => void uploadFiles()} className="mt-3 rounded-md bg-[#1e3a5f] px-3 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{uploading ? "Uploading…" : "Upload selected files"}</button>
      <div aria-live="polite" className="mt-2 text-xs">
        {stage && <p role="status">{stage} · File transfer and registration only.</p>}
        {succeeded.period === reportingPeriod && succeeded.names.length > 0 && <p className="text-emerald-800">Successfully registered {succeeded.names.length}: {succeeded.names.join(", ")}.</p>}
      </div>
      {errors.length > 0 && <div role="alert" className="mt-2 text-xs text-red-700"><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul><p className="mt-1">Failed selected files remain queued. No automatic retry. Check the registered list before uploading again; a lost response may still have saved a file.</p></div>}
      <div className="mt-4 border-t border-slate-200 pt-3">
        <h3 className="text-xs font-extrabold text-slate-900">Registered source files{validPeriod ? ` · ${reportingPeriod}` : ""}</h3>
        {!validPeriod ? <p className="mt-2 text-xs">Enter or select a closeout label to view its files.</p>
          : list.isError ? <p role="alert" className="mt-2 text-xs text-red-700">Source list unavailable; no complete count is assumed. <button type="button" className="underline" onClick={() => void list.refetch()}>Retry source list</button></p>
          : !intake.loaded ? <p role="status" className="mt-2 text-xs">Loading registered sources…</p>
          : rows.length === 0 ? <p className="mt-2 text-xs">No files registered for this closeout yet.</p> : null}
        {rows.length > 0 && <ul className="mt-2 divide-y divide-slate-100">
          {rows.map(row => <li key={row.id} className="py-2 text-xs">
            <a href={safeCloseoutSourceUrl(row.storageUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 break-all font-bold text-[#1e3a5f] underline">{row.fileName}<ExternalLink size={12} className="shrink-0" aria-hidden="true" /></a>
            <div className="mt-1">Source role: {CLOSEOUT_SOURCE_CATEGORIES.find(item => item.id === row.category)?.label ?? row.category}</div>
            <div className="mt-1 text-slate-500">{fileSize(row.sizeBytes)} · Uploaded {new Date(row.createdAtMs).toLocaleString()} · By {row.uploadedBy || "Workspace user"}</div>
            <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-800">{CLOSEOUT_SOURCE_STATUS}</span>
          </li>)}
        </ul>}
      </div>
    </section>
  );
}

export default SprintCloseoutUploads;
