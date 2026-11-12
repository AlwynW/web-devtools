import { useMemo, useState, useCallback } from "react";
import Button from "../components/Button";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import { WarningBanner } from "../components/ui/ErrorBanner";

const SAMPLE = `DATABASE_URL=postgres://localhost/db
# comment
API_KEY=secret
API_KEY=duplicate-example
`;

function parseEnv(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const rows = [];
  const keyCount = new Map();
  let i = 0;

  for (const raw of lines) {
    i++;
    const line = raw;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      rows.push({ type: "comment", line, num: i });
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      rows.push({ type: "raw", line, num: i });
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    keyCount.set(key, (keyCount.get(key) || 0) + 1);
    rows.push({ type: "kv", key, value, num: i });
  }

  const duplicates = [...keyCount.entries()]
    .filter(([, c]) => c > 1)
    .map(([k]) => k);
  return { rows, duplicates };
}

function serializeEnv(rows) {
  const out = [];
  for (const r of rows) {
    if (r.type === "comment" || r.type === "raw") {
      out.push(r.line);
      continue;
    }
    if (r.type === "kv") {
      const v = String(r.value ?? "");
      const needsQuote = /[\s#"'\\]/.test(v) || v === "";
      const esc = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      out.push(needsQuote ? `${r.key}="${esc}"` : `${r.key}=${v}`);
    }
  }
  return out.join("\n");
}

export default function EnvEditor({ onToast }) {
  const [source, setSource] = useState(SAMPLE);
  const [rows, setRows] = useState(() => parseEnv(SAMPLE).rows);

  const duplicates = useMemo(() => {
    const counts = new Map();
    for (const r of rows) {
      if (r.type === "kv") counts.set(r.key, (counts.get(r.key) || 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, c]) => c > 1)
      .map(([k]) => k);
  }, [rows]);

  const stats = useMemo(() => {
    const kv = rows.filter((r) => r.type === "kv");
    return { keys: kv.length, lines: rows.length };
  }, [rows]);

  const reparse = useCallback(() => {
    const p = parseEnv(source);
    setRows(p.rows);
    onToast?.("Parsed from textarea");
  }, [source, onToast]);

  const updateKv = (idx, field, val) => {
    setRows((prev) => {
      const next = [...prev];
      const r = { ...next[idx] };
      if (r.type === "kv") {
        if (field === "key") r.key = val;
        if (field === "value") r.value = val;
        next[idx] = r;
      }
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { type: "kv", key: "NEW_KEY", value: "", num: prev.length + 1 },
    ]);
  };

  const exported = useMemo(() => serializeEnv(rows), [rows]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title=".env editor" description={<>Parse, edit key/value rows, export again. All processing stays in your
          browser.</>} />

      <Panel className="space-y-6">
        <div>
          <label className="field-label mb-2">
            Paste .env
          </label>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            rows={6}
            className="w-full p-4 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
          />
          <Button onClick={reparse} className="mt-2 w-fit">
            Parse into table
          </Button>
        </div>

        {duplicates.length > 0 && (
          <WarningBanner className="p-3 text-sm font-mono">
            Duplicate keys: {duplicates.join(", ")}
          </WarningBanner>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-fg-muted">
            {stats.keys} keys · {stats.lines} rows
          </span>
          <button
            type="button"
            onClick={addRow}
            className="text-xs font-mono underline text-fg-muted"
          >
            Add key
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-control p-2">
          {rows.map((r, idx) => {
            if (r.type === "comment" || r.type === "raw") {
              return (
                <pre
                  key={idx}
                  className="text-xs font-mono text-fg-muted py-1 px-2 bg-surface-code rounded-control whitespace-pre-wrap"
                >
                  {r.line}
                </pre>
              );
            }
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 font-mono text-sm"
              >
                <input
                  value={r.key}
                  onChange={(e) => updateKv(idx, "key", e.target.value)}
                  className="flex-1 min-w-0 p-2 border border-border-strong rounded-control bg-surface text-fg"
                  placeholder="KEY"
                />
                <input
                  value={r.value}
                  onChange={(e) => updateKv(idx, "value", e.target.value)}
                  className="flex-[2] min-w-0 p-2 border border-border-strong rounded-control bg-surface text-fg"
                  placeholder="value"
                />
              </div>
            );
          })}
        </div>

        <div>
          <label className="field-label mb-2">
            Export
          </label>
          <CopyPre
            text={exported}
            onCopySuccess={() => onToast(".env copied!")}
            className="border border-border rounded-control bg-surface-code max-h-48 overflow-y-auto"
            preClassName="p-4 font-mono text-xs whitespace-pre-wrap break-all text-fg-soft"
          />
        </div>
      </Panel>
    </div>
  );
}
