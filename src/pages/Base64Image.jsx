import { useState, useCallback } from "react";
import { UploadSimple, X } from "phosphor-react";
import CopyArea from "../components/CopyArea";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Base64 Image Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Drag and drop an image to get the Base64 string for CSS or HTML.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed p-12 text-center transition-colors ${
            dragOver
              ? "border-stone-500 bg-stone-100/50 dark:bg-stone-900/50"
              : "border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500"
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
            <UploadSimple size={48} weight="thin" className="text-stone-400" />
            <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
              Drop an image here or click to browse
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {file && base64 && (
          <>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border border-stone-200 dark:border-stone-700 overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0">
                <img
                  src={base64}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm truncate text-stone-800 dark:text-stone-200">
                  {file.name}
                </div>
                <div className="text-xs font-mono text-stone-500">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                <button
                  onClick={clear}
                  className="mt-2 flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-red-600"
                >
                  <X size={14} weight="thin" /> Clear
                </button>
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
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
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
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
      </div>
    </div>
  );
}
