import { useState, useCallback } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";
import SegmentedControl from "../components/ui/SegmentedControl";
import Button from "../components/Button";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export default function MarkdownConverter({ onToast }) {
  const [mode, setMode] = useState("md2html");
  const [input, setInput] = useState("# Hello\n\n**Bold** and *italic* text.");
  const [output, setOutput] = useState("");
  const [outputView, setOutputView] = useState("rendered");
  const [error, setError] = useState(null);

  const convert = useCallback(async () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      if (mode === "md2html") {
        const html = await marked.parse(input);
        setOutput(html);
      } else {
        setOutput(turndown.turndown(input));
      }
    } catch (e) {
      setError(e.message || "Conversion failed");
      setOutput("");
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Markdown Converter" description="Convert between Markdown and HTML." />

      <Panel className="space-y-4">
        <SegmentedControl
          options={[
            { value: "md2html", label: "Markdown → HTML" },
            { value: "html2md", label: "HTML → Markdown" },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setOutputView(m === "md2html" ? "rendered" : "code");
          }}
        />

        <div>
          <Label>
            Input ({mode === "md2html" ? "Markdown" : "HTML"})
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={convert}
            placeholder={
              mode === "md2html"
                ? "# Heading\n\n**bold** *italic*"
                : "<h1>Heading</h1><p>Paragraph</p>"
            }
            className="w-full h-40 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={convert}>
            {" > Convert"}
          </Button>
        </div>

        {error && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {output && (
          <>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
              <Label>
                Output ({mode === "md2html" ? "HTML" : "Markdown"})
              </Label>
              <SegmentedControl
                options={[
                  { value: "rendered", label: "Rendered" },
                  { value: "code", label: "Code" },
                ]}
                value={outputView}
                onChange={setOutputView}
              />
            </div>

            {outputView === "rendered" && (
              <div className="mb-2">
                <div
                  className="p-4 bg-surface border border-border rounded-control text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_code]:bg-surface-inset [&_code]:px-1 [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:bg-surface-inset [&_a]:text-fg-soft [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html:
                      mode === "md2html"
                        ? output
                        : marked.parse(output || ""),
                  }}
                />
              </div>
            )}
            {outputView === "code" && (
              <CopyArea
                text={output}
                onCopySuccess={() =>
                  onToast(
                    mode === "md2html" ? "HTML copied!" : "Markdown copied!",
                  )
                }
              />
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
