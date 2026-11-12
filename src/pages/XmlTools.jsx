import { useState, useCallback } from "react";
import Button from "../components/Button";
import CopyPre from "../components/CopyPre";
import { formatXml, minifyXml, parseXmlError } from "../utils/xmlFormat";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function XmlTools({ onToast }) {
  const [input, setInput] = useState(
    '<note><to>Tove</to><from>Jani</from><body>Don\'t forget!</body></note>',
  );
  const [output, setOutput] = useState("");
  const [err, setErr] = useState(null);

  const validateOnly = useCallback(() => {
    const e = parseXmlError(input);
    setErr(e);
    if (e) onToast?.("Invalid XML");
    else onToast?.("Well-formed XML");
  }, [input, onToast]);

  const runFormat = () => {
    setErr(null);
    try {
      setOutput(formatXml(input));
      onToast?.("Formatted");
    } catch (e) {
      setErr(e.message || "Error");
      setOutput("");
    }
  };

  const runMinify = () => {
    setErr(null);
    try {
      setOutput(minifyXml(input));
      onToast?.("Minified");
    } catch (e) {
      setErr(e.message || "Error");
      setOutput("");
    }
  };

  const liveErr = parseXmlError(input);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="XML" description="Format, minify, and check well-formed XML in the browser." />

      <Panel className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={runFormat}>Format</Button>
          <Button variant="outline" onClick={runMinify}>
            Minify
          </Button>
          <Button variant="outline" onClick={validateOnly}>
            Validate only
          </Button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full p-4 border border-border-strong rounded-control font-mono text-xs bg-surface text-fg"
        />

        {(err || liveErr) && (
          <ErrorBanner className="p-3 text-xs font-mono">
            {err || liveErr}
          </ErrorBanner>
        )}
        {!err && !liveErr && input.trim() && (
          <p className="text-xs font-mono text-green-700 dark:text-green-400">
            Well-formed (live check)
          </p>
        )}

        {output && (
          <div>
            <span className="field-label mb-2">
              Output
            </span>
            <CopyPre
              text={output}
              onCopySuccess={() => onToast("Copied!")}
              className="border border-border rounded-control bg-surface-code max-h-80 overflow-y-auto overflow-x-auto"
              preClassName="p-4 font-mono text-xs whitespace-pre-wrap break-all text-fg-soft"
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
