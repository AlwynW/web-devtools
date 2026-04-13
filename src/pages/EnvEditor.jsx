import { useMemo, useState, useCallback } from "react";
import { copyToClipboard } from "../utils/clipboard";

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

  const copy = () =>
    copyToClipboard(exported, () => onToast(".env copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          .env editor
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Parse, edit key/value rows, export again. All processing stays in your
          browser.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
            Paste .env
          </label>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            rows={6}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          <button
            type="button"
            onClick={reparse}
            className="mt-2 px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
          >
            Parse into table
          </button>
        </div>

        {duplicates.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm font-mono">
            Duplicate keys: {duplicates.join(", ")}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-stone-500">
            {stats.keys} keys · {stats.lines} rows
          </span>
          <button
            type="button"
            onClick={addRow}
            className="text-xs font-mono underline text-stone-600 dark:text-stone-400"
          >
            Add key
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto border border-stone-200 dark:border-stone-700 p-2">
          {rows.map((r, idx) => {
            if (r.type === "comment" || r.type === "raw") {
              return (
                <pre
                  key={idx}
                  className="text-xs font-mono text-stone-500 py-1 px-2 bg-stone-50 dark:bg-stone-950 whitespace-pre-wrap"
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
                  className="flex-1 min-w-0 p-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="KEY"
                />
                <input
                  value={r.value}
                  onChange={(e) => updateKv(idx, "value", e.target.value)}
                  className="flex-[2] min-w-0 p-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="value"
                />
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
              Export
            </label>
            <button
              type="button"
              onClick={copy}
              className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs whitespace-pre-wrap break-all text-stone-800 dark:text-stone-200 max-h-48 overflow-y-auto">
            {exported}
          </pre>
        </div>
      </div>
    </div>
  );
}
