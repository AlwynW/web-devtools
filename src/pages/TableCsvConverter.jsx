import { useMemo, useState } from "react";
import Papa from "papaparse";
import { copyToClipboard } from "../utils/clipboard";

function tableToCsv(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return { error: "No <table> found", csv: "" };
  const rows = [...table.querySelectorAll("tr")].map((tr) =>
    [...tr.querySelectorAll("th,td")].map((cell) => {
      let t = cell.textContent ?? "";
      t = t.replace(/\r?\n/g, " ").trim();
      if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
      return t;
    }),
  );
  const csv = Papa.unparse(rows);
  return { error: null, csv };
}

function csvToTable(csv) {
  const parsed = Papa.parse(csv.trim(), { skipEmptyLines: true });
  if (parsed.errors?.length) {
    return {
      error: parsed.errors.map((e) => e.message).join("; "),
      html: "",
    };
  }
  const rows = parsed.data;
  if (!rows.length) return { error: "Empty CSV", html: "" };
  let html = "<table>\n";
  for (const row of rows) {
    html += "  <tr>\n";
    for (const cell of row) {
      const esc = String(cell ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      html += `    <td>${esc}</td>\n`;
    }
    html += "  </tr>\n";
  }
  html += "</table>";
  return { error: null, html };
}

export default function TableCsvConverter({ onToast }) {
  const [htmlIn, setHtmlIn] = useState(
    "<table><tr><th>Name</th><th>Role</th></tr><tr><td>Ada</td><td>Dev</td></tr></table>",
  );
  const [csvIn, setCsvIn] = useState("Name,Role\nAda,Dev");

  const toCsv = useMemo(() => tableToCsv(htmlIn), [htmlIn]);
  const toHtml = useMemo(() => csvToTable(csvIn), [csvIn]);

  const copy = (text) =>
    copyToClipboard(text, () => onToast("Copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          HTML table ↔ CSV
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          First table in HTML, or CSV to a simple HTML table.
        </p>
      </header>

      <div className="space-y-8">
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-3">
          <h3 className="text-sm font-mono text-stone-700 dark:text-stone-300">
            HTML → CSV
          </h3>
          <textarea
            value={htmlIn}
            onChange={(e) => setHtmlIn(e.target.value)}
            rows={6}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          {toCsv.error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {toCsv.error}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-stone-500 font-mono">CSV</span>
            <button
              type="button"
              onClick={() => copy(toCsv.csv)}
              className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs whitespace-pre-wrap text-stone-800 dark:text-stone-200 max-h-40 overflow-y-auto">
            {toCsv.csv || "—"}
          </pre>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-3">
          <h3 className="text-sm font-mono text-stone-700 dark:text-stone-300">
            CSV → HTML
          </h3>
          <textarea
            value={csvIn}
            onChange={(e) => setCsvIn(e.target.value)}
            rows={6}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          {toHtml.error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {toHtml.error}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-stone-500 font-mono">HTML</span>
            <button
              type="button"
              onClick={() => copy(toHtml.html)}
              className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs whitespace-pre-wrap text-stone-800 dark:text-stone-200 max-h-48 overflow-y-auto">
            {toHtml.html || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
