import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";
import SegmentedControl from "../components/ui/SegmentedControl";

const CONTEXTS = [
  { value: "json", label: "JSON" },
  { value: "regex", label: "Regex" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "shell", label: "Shell" },
];

const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unescapeRegex(str) {
  return str.replace(/\\(.)/g, "$1");
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

function unescapeSql(str) {
  return str.replace(/''/g, "'");
}

function escapeShell(str) {
  return "'" + str.replace(/'/g, "'\"'\"'") + "'";
}

function unescapeShell(str) {
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return str;
}

export default function EscapeUnescape({ onToast }) {
  const [context, setContext] = useState("json");
  const [mode, setMode] = useState("escape");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      let result;
      if (context === "json") {
        result = mode === "escape"
          ? JSON.stringify(input)
          : JSON.parse(input);
      } else if (context === "regex") {
        result = mode === "escape" ? escapeRegex(input) : unescapeRegex(input);
      } else if (context === "sql") {
        result = mode === "escape" ? escapeSql(input) : unescapeSql(input);
      } else if (context === "html") {
        result = mode === "escape" ? escapeHtml(input) : unescapeHtml(input);
      } else if (context === "shell") {
        result = mode === "escape" ? escapeShell(input) : unescapeShell(input);
      } else {
        result = "";
      }
      return { output: result, error: null };
    } catch (e) {
      return { output: "", error: e.message || "Failed" };
    }
  }, [input, context, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Escape / Unescape" description="Escape strings for JSON, regex, SQL, HTML, or shell." />

      <Panel className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Label className="mb-1">
              Context
            </Label>
            <SegmentedControl
              options={CONTEXTS}
              value={context}
              onChange={setContext}
            />
          </div>
          <div>
            <Label className="mb-1">
              Mode
            </Label>
            <SegmentedControl
              options={[
                { value: "escape", label: "Escape" },
                { value: "unescape", label: "Unescape" },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>
        </div>

        <div>
          <Label>
            Input
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "escape" ? "Enter text to escape" : "Enter escaped text"}
            className="w-full h-32 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {error && (
          <ErrorBanner className="p-4 font-mono text-sm">
            {error}
          </ErrorBanner>
        )}

        {output !== "" && (
          <>
            <Label>
              Output
            </Label>
            <CopyArea
              text={typeof output === "string" ? output : JSON.stringify(output, null, 2)}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
