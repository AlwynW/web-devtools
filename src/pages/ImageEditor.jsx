import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { UploadSimple, DownloadSimple, X } from "phosphor-react";
import { downloadCanvas } from "../utils/assetGridComposer";

const RANGE_CLASS =
  "w-full h-2 bg-stone-200 dark:bg-stone-700 appearance-none cursor-pointer accent-stone-800 dark:accent-stone-200";

function buildFilter({ greyscale, invert, hue, saturation }) {
  const parts = [];
  if (greyscale) parts.push("grayscale(1)");
  else if (saturation !== 100) parts.push(`saturate(${saturation / 100})`);
  if (invert) parts.push("invert(1)");
  if (hue !== 0) parts.push(`hue-rotate(${hue}deg)`);
  return parts.length ? parts.join(" ") : "none";
}

export default function ImageEditor({ onToast }) {
  const [src, setSrc] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [greyscale, setGreyscale] = useState(false);
  const [invert, setInvert] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const objectUrlRef = useRef(null);
  const imageRef = useRef(null);

  const filter = useMemo(
    () => buildFilter({ greyscale, invert, hue, saturation }),
    [greyscale, invert, hue, saturation],
  );

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokeObjectUrl(), [revokeObjectUrl]);

  const processFile = useCallback(
    (file) => {
      setError(null);
      if (!file || !file.type.startsWith("image/")) {
        setError("Please drop an image file (PNG, JPG, GIF, WebP, etc.)");
        return;
      }
      revokeObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setSrc(url);
      setFileName(file.name);
    },
    [revokeObjectUrl],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const clearImage = () => {
    revokeObjectUrl();
    setSrc(null);
    setFileName(null);
    setError(null);
  };

  const resetFilters = () => {
    setGreyscale(false);
    setInvert(false);
    setHue(0);
    setSaturation(100);
  };

  const download = async (mimeType) => {
    const img = imageRef.current;
    if (!img || !img.naturalWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = filter === "none" ? "none" : filter;
    ctx.drawImage(img, 0, 0);
    const base = (fileName || "image").replace(/\.[^.]+$/, "");
    const ext = mimeType === "image/jpeg" ? "jpg" : "png";
    try {
      await downloadCanvas(
        canvas,
        `${base}-edited.${ext}`,
        mimeType,
        mimeType === "image/jpeg" ? 0.92 : undefined,
      );
      onToast?.("Image downloaded!");
    } catch {
      setError("Failed to download image");
    }
  };

  const toggleClass = (active) =>
    `px-3 py-1.5 font-mono text-xs border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border-stone-900 dark:border-stone-100"
        : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
    }`;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Editor
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Greyscale, invert, and hue/saturation tweaks — then download.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed p-10 text-center transition-colors ${
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
            id="image-editor-file-input"
          />
          <label
            htmlFor="image-editor-file-input"
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

        {src && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-sm text-stone-600 dark:text-stone-300 truncate">
                {fileName}
              </span>
              <button
                type="button"
                onClick={clearImage}
                className="flex items-center gap-1.5 text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={14} weight="thin" />
                Clear
              </button>
            </div>

            <div className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 p-4 flex items-center justify-center min-h-[200px]">
              <img
                ref={imageRef}
                src={src}
                alt="Preview"
                style={{ filter }}
                className="max-w-full max-h-[420px] object-contain"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Effects
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGreyscale((v) => !v)}
                  className={toggleClass(greyscale)}
                >
                  Greyscale
                </button>
                <button
                  type="button"
                  onClick={() => setInvert((v) => !v)}
                  className={toggleClass(invert)}
                >
                  Invert
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-1.5 font-mono text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    Hue
                  </label>
                  <span className="text-xs font-mono text-stone-600 dark:text-stone-300 tabular-nums">
                    {hue}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className={RANGE_CLASS}
                />
              </div>
              <div>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    Saturation
                  </label>
                  <span className="text-xs font-mono text-stone-600 dark:text-stone-300 tabular-nums">
                    {saturation}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  disabled={greyscale}
                  className={`${RANGE_CLASS} disabled:opacity-40 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => download("image/png")}
                className="flex items-center gap-2 px-4 py-2 font-mono text-xs bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-900 dark:border-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
              >
                <DownloadSimple size={16} weight="thin" />
                Download PNG
              </button>
              <button
                type="button"
                onClick={() => download("image/jpeg")}
                className="flex items-center gap-2 px-4 py-2 font-mono text-xs border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <DownloadSimple size={16} weight="thin" />
                Download JPG
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
