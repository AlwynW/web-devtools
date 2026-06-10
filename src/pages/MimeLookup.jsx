import { useMemo, useState } from "react";
import { MIME_BY_EXT } from "../data/mimeTypes";
import CopyButton from "../components/CopyButton";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          MIME lookup
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Extension to MIME type. Pick a file to read browser{" "}
          <code className="text-stone-600 dark:text-stone-300">File.type</code>.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search extension or MIME (e.g. svg, json, image/)"
          className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
        <label className="inline-flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400 cursor-pointer border border-dashed border-stone-400 dark:border-stone-600 px-3 py-2">
          <input type="file" className="sr-only" onChange={onFile} />
          Choose file (hint only)
        </label>

        <div className="max-h-[28rem] overflow-y-auto border border-stone-200 dark:border-stone-700">
          <table className="w-full text-left text-sm font-mono">
            <thead className="sticky top-0 bg-stone-100 dark:bg-stone-800 text-[11px] uppercase tracking-wider text-stone-500">
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
                  className="border-t border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-950 group"
                >
                  <td className="p-2 pl-3 text-stone-800 dark:text-stone-200">
                    .{ext}
                  </td>
                  <td className="p-2 text-stone-600 dark:text-stone-400 break-all">
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
            <p className="p-6 text-sm text-stone-500 text-center">No matches.</p>
          )}
        </div>
      </div>
    </div>
  );
}
