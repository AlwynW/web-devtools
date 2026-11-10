import { useState } from "react";
import { format } from "sql-formatter";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

const DIALECTS = [
  { id: "sql", label: "Standard SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
];

export default function SqlFormatter({ onToast }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [dialect, setDialect] = useState("sql");

  const doFormat = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(format(input, { language: dialect }));
    } catch (e) {
      setError(e.message || "Format failed");
      setOutput("");
    }
  };

  const doMinify = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const formatted = format(input, { language: dialect });
      setOutput(formatted.replace(/\s+/g, " ").trim());
    } catch (e) {
      setError(e.message || "Minify failed");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="SQL Formatter" description="Format and minify SQL queries." />

      <Panel className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Label className="mb-1">
              Dialect
            </Label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={doFormat}>Format</Button>
            <Button onClick={doMinify} variant="secondary">
              Minify
            </Button>
          </div>
        </div>

        <Label>
          Input SQL
        </Label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT * FROM users WHERE id = 1"
          className="w-full h-40 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
        />

        {error && (
          <ErrorBanner className="p-4 font-mono text-sm">
            {error}
          </ErrorBanner>
        )}

        {output && (
          <>
            <Label>
              Output
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
