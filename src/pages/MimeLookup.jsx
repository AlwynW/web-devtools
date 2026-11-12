import { useMemo, useState } from "react";
import { MIME_BY_EXT } from "../data/mimeTypes";
import CopyButton from "../components/CopyButton";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

const entries = Object.entries(MIME_BY_EXT).sort(([a], [b]) =>
  a.localeCompare(b),
);

export default function MimeLookup({ onToast }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\./, "");
    if (!s) return entries.slice(0, 80);
    return entries.filter(
      ([ext, mime]) =>
        ext.includes(s) || mime.toLowerCase().includes(s),
    );
  }, [q]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f?.type) {
      onToast?.(`File.type: ${f.type}`);
    }
    e.target.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="MIME lookup" description={<>Extension to MIME type. Pick a file to read browser{" "}
          <code className="text-fg-muted">File.type</code>.</>} />

      <Panel className="space-y-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search extension or MIME (e.g. svg, json, image/)"
          className="w-full p-4 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
        />
        <label className="inline-flex items-center gap-2 text-xs font-mono text-fg-muted cursor-pointer border border-dashed border-border-muted rounded-button px-3 py-2">
          <input type="file" className="sr-only" onChange={onFile} />
          Choose file (hint only)
        </label>

        <div className="max-h-[28rem] overflow-y-auto border border-border rounded-control">
          <table className="w-full text-left text-sm font-mono">
            <thead className="sticky top-0 bg-hover-muted text-[11px] uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="p-2 pl-3">Ext</th>
                <th className="p-2">MIME</th>
                <th className="p-2 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(([ext, mime]) => (
                <tr
                  key={ext}
                  className="border-t border-border hover:bg-hover dark:hover:bg-stone-950 group"
                >
                  <td className="p-2 pl-3 text-fg-soft">
                    .{ext}
                  </td>
                  <td className="p-2 text-fg-muted break-all">
                    {mime}
                  </td>
                  <td className="p-2">
                    <CopyButton
                      text={mime}
                      onCopySuccess={() => onToast("MIME copied!")}
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="p-6 text-sm text-fg-muted text-center">No matches.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}
