import { useState, useCallback, useEffect, useRef } from "react";
import { FileArrowDown, CornersOut, CornersIn } from "phosphor-react";
import Button from "../components/Button";
import CopyButton from "../components/CopyButton";
import { renderMarkdownWithMermaid } from "../utils/markdownWithMermaid";
import { isDarkTheme, subscribeTheme } from "../theme/applyTheme";
import Label from "../components/ui/Label";
import PageHeader from "../components/ui/PageHeader";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function MarkdownViewer({ onToast }) {
  const [markdownInput, setMarkdownInput] = useState("");
  const [content, setContent] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [dark, setDark] = useState(isDarkTheme);
  const requestId = useRef(0);

  useEffect(() => subscribeTheme(setDark), []);

  const parseMarkdown = useCallback(async (text) => {
    const id = ++requestId.current;
    setError(null);
    const raw = String(text ?? "");
    if (!raw.trim()) {
      setContent(null);
      return;
    }
    try {
      const html = await renderMarkdownWithMermaid(raw, { dark });
      if (id !== requestId.current) return;
      setContent(html);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e.message || "Failed to parse markdown");
      setContent(null);
    }
  }, [dark]);

  const processFile = useCallback((file) => {
    setError(null);

    if (!file) return;

    const ext = file.name.toLowerCase().split(".").pop();
    const isMd = ext === "md" || ext === "markdown";
    if (!isMd) {
      setError("Please drop a Markdown file (.md or .markdown)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setMarkdownInput(String(reader.result ?? ""));
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      parseMarkdown(markdownInput);
    }, 200);
    return () => clearTimeout(t);
  }, [markdownInput, parseMarkdown]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const clear = () => {
    setMarkdownInput("");
    setContent(null);
    setFileName(null);
    setError(null);
  };

  return (
    <div className={`mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${fullWidth ? "relative left-1/2 -translate-x-1/2 w-screen max-w-none px-4 sm:px-6" : "max-w-3xl"}`}>
      <PageHeader
        className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        titleClassName="text-center sm:text-left"
        title="Markdown Viewer"
        description="Drop a .md file or type markdown. Fenced mermaid blocks render as diagrams."
      >
        <Button
          variant={fullWidth ? "primary" : "outline"}
          icon={fullWidth ? CornersIn : CornersOut}
          onClick={() => setFullWidth((v) => !v)}
          className="shrink-0 self-center sm:self-auto"
        >
          {fullWidth ? "Narrow" : "Fit width"}
        </Button>
      </PageHeader>

      <div className="space-y-6">
        <div>
          <Label>
            Markdown Input
          </Label>
          <textarea
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder="# Paste or type markdown here"
            className="w-full h-40 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-panel p-8 text-center transition-colors bg-surface border-border-strong ${
            dragOver
              ? "border-focus bg-shell/50"
              : "hover:border-border-muted dark:hover:border-stone-600"
          }`}
        >
          <input
            type="file"
            accept=".md,.markdown"
            onChange={handleFileInput}
            className="hidden"
            id="md-viewer-file-input"
          />
          <label
            htmlFor="md-viewer-file-input"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <FileArrowDown size={40} weight="thin" className="text-fg-subtle" />
            <span className="font-mono text-sm text-fg-muted">
              Drop a markdown file here or click to browse
            </span>
          </label>
        </div>

        {error && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {content && (
          <div className="bg-surface border border-border rounded-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 bg-surface-muted/50">
              <span className="font-mono text-sm text-fg-muted truncate">
                {fileName || "Direct input"}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton
                  text={markdownInput}
                  onCopySuccess={() => onToast?.("Markdown copied!")}
                  title="Copy markdown"
                  size={16}
                />
                <button
                  onClick={clear}
                  className="text-xs font-mono text-fg-muted hover:text-fg"
                >
                  Clear
                </button>
              </div>
            </div>
            <div
              className="markdown-preview p-6 text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-4 [&_ol]:space-y-1 [&_li]:mb-1 [&_code]:bg-surface-inset [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:bg-surface-inset [&_pre]:rounded-control [&_pre]:mb-4 [&_a]:text-fg-soft [&_a]:underline [&_blockquote]:border-l-fg-muted [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_hr]:my-6"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
