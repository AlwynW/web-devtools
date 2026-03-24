import { useState, useCallback } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import CopyArea from "../components/CopyArea";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Markdown Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert between Markdown and HTML.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          <button
            onClick={() => {
              setMode("md2html");
              setOutputView("rendered");
            }}
            className={`px-3 py-1.5 transition-colors ${
              mode === "md2html"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            Markdown → HTML
          </button>
          <button
            onClick={() => {
              setMode("html2md");
              setOutputView("code");
            }}
            className={`px-3 py-1.5 transition-colors ${
              mode === "html2md"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            HTML → Markdown
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input ({mode === "md2html" ? "Markdown" : "HTML"})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={convert}
            placeholder={
              mode === "md2html"
                ? "# Heading\n\n**bold** *italic*"
                : "<h1>Heading</h1><p>Paragraph</p>"
            }
            className="w-full h-40 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={convert}
            className="px-4 py-2 border border-stone-400 dark:border-stone-600 text-xs font-mono tracking-tight text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {" > Convert"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {output && (
          <>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                Output ({mode === "md2html" ? "HTML" : "Markdown"})
              </label>
              <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
                <button
                  onClick={() => setOutputView("rendered")}
                  className={`px-3 py-1.5 transition-colors ${
                    outputView === "rendered"
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  Rendered
                </button>
                <button
                  onClick={() => setOutputView("code")}
                  className={`px-3 py-1.5 transition-colors ${
                    outputView === "code"
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            {outputView === "rendered" && (
              <div className="mb-2">
                <div
                  className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_code]:bg-stone-100 [&_code]:dark:bg-stone-800 [&_code]:px-1 [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:bg-stone-100 [&_pre]:dark:bg-stone-800 [&_a]:text-stone-700 [&_a]:dark:text-stone-300 [&_a]:underline"
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
      </div>
    </div>
  );
}
