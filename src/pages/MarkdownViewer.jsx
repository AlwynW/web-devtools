import { useState, useCallback } from "react";
import { marked } from "marked";
import { FileDown, Maximize2, Minimize2 } from "lucide-react";

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
    <div className={`mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${fullWidth ? "max-w-none w-full" : "max-w-3xl"}`}>
      <header className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Markdown Viewer
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Drop a .md file to preview it. No editing — just viewing.
          </p>
        </div>
        <button
          onClick={() => setFullWidth((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 self-center sm:self-auto ${
            fullWidth
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          {fullWidth ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          {fullWidth ? "Narrow" : "Fit width"}
        </button>
      </header>

      <div className="space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 ${
            dragOver
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
              : "hover:border-slate-400 dark:hover:border-slate-500"
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
            <FileDown size={40} className="text-slate-400" />
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Drop a markdown file here or click to browse
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {content && fileName && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                {fileName}
              </span>
              <button
                onClick={clear}
                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 ml-2"
              >
                Clear
              </button>
            </div>
            <div
              className="p-6 text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-4 [&_ol]:space-y-1 [&_li]:mb-1 [&_code]:bg-slate-100 [&_code]:dark:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:bg-slate-100 [&_pre]:dark:bg-slate-900 [&_pre]:mb-4 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-blue-500 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_hr]:my-6"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
