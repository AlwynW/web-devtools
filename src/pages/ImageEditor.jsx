import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { UploadSimple, DownloadSimple, X } from "phosphor-react";
import { downloadCanvas } from "../utils/assetGridComposer";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

const RANGE_CLASS =
  "w-full h-2 bg-secondary-hover appearance-none cursor-pointer accent-fg";

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
        ? "bg-primary text-primary-fg rounded-button border-inverse-border"
        : "bg-surface text-fg-muted border-border-strong hover:bg-hover-muted"
    }`;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Editor" description="Greyscale, invert, and hue/saturation tweaks — then download." />

      <Panel className="space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed p-10 text-center transition-colors ${
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
            id="image-editor-file-input"
          />
          <label
            htmlFor="image-editor-file-input"
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

        {src && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-sm text-fg-muted truncate">
                {fileName}
              </span>
              <button
                type="button"
                onClick={clearImage}
                className="flex items-center gap-1.5 text-xs font-mono text-fg-muted hover:text-fg"
              >
                <X size={14} weight="thin" />
                Clear
              </button>
            </div>

            <div className="border border-border bg-surface-code p-4 flex items-center justify-center min-h-[200px]">
              <img
                ref={imageRef}
                src={src}
                alt="Preview"
                style={{ filter }}
                className="max-w-full max-h-[420px] object-contain"
              />
            </div>

            <div>
              <Label>
                Effects
              </Label>
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
                  className="px-3 py-1.5 font-mono text-xs text-fg-muted hover:text-fg border border-transparent"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <Label>
                    Hue
                  </Label>
                  <span className="text-xs font-mono text-fg-muted tabular-nums">
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
                  <Label>
                    Saturation
                  </Label>
                  <span className="text-xs font-mono text-fg-muted tabular-nums">
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
                className="flex items-center gap-2 px-4 py-2 font-mono text-xs bg-primary text-primary-fg rounded-button border border-inverse-border hover:bg-primary-hover transition-colors"
              >
                <DownloadSimple size={16} weight="thin" />
                Download PNG
              </button>
              <button
                type="button"
                onClick={() => download("image/jpeg")}
                className="flex items-center gap-2 px-4 py-2 font-mono text-xs border border-border-strong text-fg-soft hover:bg-hover-muted transition-colors"
              >
                <DownloadSimple size={16} weight="thin" />
                Download JPG
              </button>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
