import { useMemo, useState } from "react";
import Papa from "papaparse";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="HTML table ↔ CSV" description="First table in HTML, or CSV to a simple HTML table." />

      <div className="space-y-8">
        <Panel className="space-y-3">
          <h3 className="text-sm font-mono text-fg-soft">
            HTML → CSV
          </h3>
          <textarea
            value={htmlIn}
            onChange={(e) => setHtmlIn(e.target.value)}
            rows={6}
            className="w-full p-4 border border-border-strong font-mono text-xs bg-surface text-fg"
          />
          {toCsv.error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {toCsv.error}
            </p>
          )}
          <span className="block text-[11px] text-fg-muted font-mono mb-2">CSV</span>
          <CopyPre
            text={toCsv.csv || ""}
            onCopySuccess={() => onToast("Copied!")}
            className="border border-border bg-surface-code max-h-40 overflow-y-auto"
            preClassName="p-4 font-mono text-xs whitespace-pre-wrap text-fg-soft"
          >
            {toCsv.csv || "—"}
          </CopyPre>
        </Panel>

        <Panel className="space-y-3">
          <h3 className="text-sm font-mono text-fg-soft">
            CSV → HTML
          </h3>
          <textarea
            value={csvIn}
            onChange={(e) => setCsvIn(e.target.value)}
            rows={6}
            className="w-full p-4 border border-border-strong font-mono text-xs bg-surface text-fg"
          />
          {toHtml.error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {toHtml.error}
            </p>
          )}
          <span className="block text-[11px] text-fg-muted font-mono mb-2">HTML</span>
          <CopyPre
            text={toHtml.html || ""}
            onCopySuccess={() => onToast("Copied!")}
            className="border border-border bg-surface-code max-h-48 overflow-y-auto"
            preClassName="p-4 font-mono text-xs whitespace-pre-wrap text-fg-soft"
          >
            {toHtml.html || "—"}
          </CopyPre>
        </Panel>
      </div>
    </div>
  );
}
