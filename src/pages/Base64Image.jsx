import { useState, useCallback } from "react";
import { UploadSimple, X } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function Base64Image({ onToast }) {
  const [file, setFile] = useState(null);
  const [base64, setBase64] = useState("");
  const [format, setFormat] = useState("css");
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((f) => {
    setError(null);
    setFile(null);
    setBase64("");

    if (!f || !f.type.startsWith("image/")) {
      setError("Please drop an image file (PNG, JPG, GIF, WebP, etc.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      setFile(f);
      setBase64(data);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const clear = () => {
    setFile(null);
    setBase64("");
    setError(null);
  };

  const output =
    format === "css"
      ? `url(${base64})`
      : format === "html"
        ? `<img src="${base64}" alt="" />`
        : base64;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Base64 Image Converter" description="Drag and drop an image to get the Base64 string for CSS or HTML." />

      <Panel className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed p-12 text-center transition-colors ${
            dragOver
              ? "border-focus bg-shell/50"
              : "border-border-strong hover:border-border-muted"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="base64-file-input"
          />
          <label
            htmlFor="base64-file-input"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <UploadSimple size={48} weight="thin" className="text-fg-subtle" />
            <span className="font-mono text-sm text-fg-muted">
              Drop an image here or click to browse
            </span>
          </label>
        </div>

        {error && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {file && base64 && (
          <>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border border-border overflow-hidden bg-shell shrink-0">
                <img
                  src={base64}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm truncate text-fg-soft">
                  {file.name}
                </div>
                <div className="text-xs font-mono text-fg-muted">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                <button
                  onClick={clear}
                  className="mt-2 flex items-center gap-1 text-xs font-mono text-fg-muted hover:text-red-600"
                >
                  <X size={14} weight="thin" /> Clear
                </button>
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control w-max font-mono text-[11px]">
              {[
                { id: "raw", label: "Raw" },
                { id: "css", label: "CSS url()" },
                { id: "html", label: "HTML img" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFormat(m.id)}
                  className={`px-3 py-1.5 transition-colors ${
                    format === m.id
                      ? "bg-primary text-primary-fg border border-primary-border rounded-button"
                      : "text-fg-muted hover:bg-hover-muted"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

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
