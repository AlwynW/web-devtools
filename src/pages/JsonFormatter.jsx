import { useState } from "react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function JsonFormatter({ onToast }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const format = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  const validate = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      JSON.parse(input);
      setOutput("Valid JSON");
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="JSON Formatter" description="Format and validate JSON with pretty-print and error reporting." />

      <Panel className="space-y-4">
        <Label>
          Input JSON
        </Label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-40 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
        />

        <div className="flex gap-2">
          <Button onClick={format}>Format</Button>
          <Button onClick={validate} variant="secondary">
            Validate
          </Button>
        </div>

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
            <CopyArea
              text={output}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
