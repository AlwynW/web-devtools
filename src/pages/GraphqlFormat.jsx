import { useMemo, useState } from "react";
import { parse, print, stripIgnoredCharacters } from "graphql";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

const SAMPLE = `query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}`;

export default function GraphqlFormat({ onToast }) {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState("pretty");

  const { output, error } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { output: "", error: null };
    try {
      const doc = parse(trimmed, { noLocation: true });
      const printed = print(doc);
      if (mode === "minify") {
        return { output: stripIgnoredCharacters(printed), error: null };
      }
      return { output: printed, error: null };
    } catch (e) {
      return { output: "", error: e.message || "Invalid GraphQL" };
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="GraphQL format" description="Parse and print GraphQL documents. Validates syntax; no server." />

      <Panel className="space-y-4">
        <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control font-mono text-[11px] w-fit">
          <button
            type="button"
            onClick={() => setMode("pretty")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "pretty"
                ? "bg-primary text-primary-fg rounded-button"
                : "text-fg-muted hover:bg-hover-muted"
            }`}
          >
            Pretty
          </button>
          <button
            type="button"
            onClick={() => setMode("minify")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "minify"
                ? "bg-primary text-primary-fg rounded-button"
                : "text-fg-muted hover:bg-hover-muted"
            }`}
          >
            Minify
          </button>
        </div>

        <div>
          <Label>
            Input
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="query { field }"
            className="w-full h-48 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {error && (
          <ErrorBanner className="p-4 font-mono text-sm">
            {error}
          </ErrorBanner>
        )}

        {output && !error && (
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
