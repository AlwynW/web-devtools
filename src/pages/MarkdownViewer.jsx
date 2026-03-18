import { useState, useCallback } from "react";
import { marked } from "marked";
import { FileArrowDown, CornersOut, CornersIn } from "phosphor-react";

export default function MarkdownViewer() {
  const [content, setContent] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);

  const processFile = useCallback((file) => {
    setError(null);
    setContent(null);
    setFileName(null);

    if (!file) return;

    const ext = file.name.toLowerCase().split(".").pop();
    const isMd = ext === "md" || ext === "markdown";
    if (!isMd) {
      setError("Please drop a Markdown file (.md or .markdown)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result;
        const html = await marked.parse(text);
        setContent(html);
        setFileName(file.name);
      } catch (e) {
        setError(e.message || "Failed to parse markdown");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

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
    setContent(null);
    setFileName(null);
    setError(null);
  };

  return (
    <div className={`mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${fullWidth ? "relative left-1/2 -translate-x-1/2 w-screen max-w-none px-4 sm:px-6" : "max-w-3xl"}`}>
      <header className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
            Markdown Viewer
          </h2>
          <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
            Drop a .md file to preview it. No editing — just viewing.
          </p>
        </div>
        <button
          onClick={() => setFullWidth((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-tight border transition-colors shrink-0 self-center sm:self-auto ${
            fullWidth
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border-stone-900 dark:border-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200"
              : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          {fullWidth ? <CornersIn size={18} weight="thin" /> : <CornersOut size={18} weight="thin" />}
          {fullWidth ? "Narrow" : "Fit width"}
        </button>
      </header>

      <div className="space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed p-8 text-center transition-colors bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 ${
            dragOver
              ? "border-stone-500 bg-stone-100/50 dark:bg-stone-900/50"
              : "hover:border-stone-400 dark:hover:border-stone-600"
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
            <FileArrowDown size={40} weight="thin" className="text-stone-400" />
            <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
              Drop a markdown file here or click to browse
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {content && fileName && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between bg-stone-50 dark:bg-stone-900/50">
              <span className="font-mono text-sm text-stone-600 dark:text-stone-300 truncate">
                {fileName}
              </span>
              <button
                onClick={clear}
                className="text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 shrink-0 ml-2"
              >
                Clear
              </button>
            </div>
            <div
              className="p-6 text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-4 [&_ol]:space-y-1 [&_li]:mb-1 [&_code]:bg-stone-100 [&_code]:dark:bg-stone-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:bg-stone-100 [&_pre]:dark:bg-stone-800 [&_pre]:mb-4 [&_a]:text-stone-700 [&_a]:dark:text-stone-300 [&_a]:underline [&_blockquote]:border-l-stone-500 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_hr]:my-6"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
