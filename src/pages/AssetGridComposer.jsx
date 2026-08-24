import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Trash,
  UploadSimple,
  X,
} from "phosphor-react";
import Button from "../components/Button";
import {
  clampTrim,
  createExportCanvas,
  downloadCanvas,
  drawTrimOverlay,
  exportSize,
  fittedHeightFromImages,
  loadImageFile,
  renderAssetGrid,
} from "../utils/assetGridComposer";

const INPUT_CLASS =
  "w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100";

const LABEL_CLASS =
  "block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2";

const ZERO_TRIM = { top: 0, bottom: 0, left: 0, right: 0 };

const FIT_MODES = [
  { id: "cover", label: "Cover" },
  { id: "contain", label: "Contain" },
  { id: "fill", label: "Fill" },
];

function parsePositiveInt(value, fallback, min = 0) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, n);
}

export default function AssetGridComposer({ onToast }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragEdgeRef = useRef(null);

  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [cols, setCols] = useState(2);
  const [canvasWidth, setCanvasWidth] = useState(1920);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [spacing, setSpacing] = useState(0);
  const [fitMode, setFitMode] = useState("cover");
  const [trim, setTrim] = useState(ZERO_TRIM);
  const [handlePx, setHandlePx] = useState(ZERO_TRIM);

  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const exportDims = useMemo(
    () => exportSize(canvasWidth, canvasHeight, trim),
    [canvasWidth, canvasHeight, trim],
  );

  const revokeAll = useCallback((items) => {
    items.forEach((item) => {
      if (item.objectUrl) URL.revokeObjectURL(item.objectUrl);
    });
  }, []);

  useEffect(() => {
    return () => revokeAll(imagesRef.current);
  }, [revokeAll]);

  const addFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
      if (!files.length) {
        onToast?.("Drop image files (PNG, JPG, WebP, GIF, …).");
        return;
      }
      try {
        const loaded = await Promise.all(files.map(loadImageFile));
        setImages((prev) => [...prev, ...loaded]);
        onToast?.(loaded.length === 1 ? "Added 1 image." : `Added ${loaded.length} images.`);
      } catch {
        onToast?.("Could not read one of the images.");
      }
    },
    [onToast],
  );

  const clearAll = () => {
    setImages((prev) => {
      revokeAll(prev);
      return [];
    });
    onToast?.("Canvas cleared.");
  };

  const removeAt = (index) => {
    setImages((prev) => {
      const item = prev[index];
      if (item?.objectUrl) URL.revokeObjectURL(item.objectUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveAt = (index, dir) => {
    setImages((prev) => {
      const nextIndex = index + dir;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const syncHandles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    setHandlePx({
      top: trim.top * scaleY,
      bottom: trim.bottom * scaleY,
      left: trim.left * scaleX,
      right: trim.right * scaleX,
    });
  }, [trim]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    renderAssetGrid(ctx, images, {
      width: canvasWidth,
      height: canvasHeight,
      cols,
      spacing,
      fitMode,
    });
    drawTrimOverlay(ctx, canvasWidth, canvasHeight, trim);
    requestAnimationFrame(syncHandles);
  }, [images, canvasWidth, canvasHeight, cols, spacing, fitMode, trim, syncHandles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncHandles);
      return () => window.removeEventListener("resize", syncHandles);
    }
    const ro = new ResizeObserver(() => syncHandles());
    ro.observe(canvas);
    if (wrapper) ro.observe(wrapper);
    window.addEventListener("resize", syncHandles);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHandles);
    };
  }, [syncHandles]);

  useEffect(() => {
    const onMove = (e) => {
      const edge = dragEdgeRef.current;
      const canvas = canvasRef.current;
      if (!edge || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      setTrim((prev) => {
        const next = { ...prev };
        if (edge === "top") {
          next.top = Math.max(0, (e.clientY - rect.top) * scaleY);
        } else if (edge === "bottom") {
          next.bottom = Math.max(0, (rect.bottom - e.clientY) * scaleY);
        } else if (edge === "left") {
          next.left = Math.max(0, (e.clientX - rect.left) * scaleX);
        } else if (edge === "right") {
          next.right = Math.max(0, (rect.right - e.clientX) * scaleX);
        }
        return clampTrim(next, canvas.width, canvas.height);
      });
    };

    const onUp = () => {
      if (!dragEdgeRef.current) return;
      dragEdgeRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const startHandleDrag = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    dragEdgeRef.current = edge;
    document.body.style.cursor = edge === "top" || edge === "bottom" ? "ns-resize" : "ew-resize";
    document.body.style.userSelect = "none";
  };

  const fitHeight = () => {
    if (!images.length) {
      onToast?.("Add some images first.");
      return;
    }
    const next = fittedHeightFromImages(images, canvasWidth, cols, spacing);
    if (next == null) return;
    setCanvasHeight(next);
    setTrim((prev) => clampTrim(prev, canvasWidth, next));
    onToast?.("Height fitted to the grid.");
  };

  const save = async (format) => {
    if (!images.length) {
      onToast?.("Add some images first.");
      return;
    }
    const isJpg = format === "jpeg";
    const canvas = createExportCanvas(
      images,
      { width: canvasWidth, height: canvasHeight, cols, spacing, fitMode },
      trim,
      { fillWhite: isJpg },
    );
    const ext = isJpg ? "jpg" : "png";
    try {
      await downloadCanvas(
        canvas,
        `composed-${Date.now()}.${ext}`,
        isJpg ? "image/jpeg" : "image/png",
        isJpg ? 0.92 : undefined,
      );
      onToast?.(`Downloaded ${ext.toUpperCase()} (${exportDims.width}×${exportDims.height}).`);
    } catch {
      onToast?.("Export failed.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Asset Grid
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Compose multiple images on one canvas and export PNG or JPG.
        </p>
      </header>

      <div className="space-y-6">
        <section className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
              Images
            </h3>
            {images.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <X size={14} weight="thin" /> Clear all
              </button>
            )}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed text-center cursor-pointer transition-colors ${
              images.length ? "p-6" : "p-12"
            } ${
              dragOver
                ? "border-stone-500 bg-stone-100/50 dark:bg-stone-800/50"
                : "border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <UploadSimple size={images.length ? 32 : 48} weight="thin" className="text-stone-400" />
              <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
                Drop images here or click to browse
              </span>
            </div>
          </div>

          {images.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((item, index) => (
                <li
                  key={item.id}
                  className="group relative aspect-square bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 overflow-hidden"
                >
                  <img
                    src={item.objectUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-stone-950/55 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Move left"
                        onClick={() => moveAt(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 disabled:opacity-40"
                      >
                        <CaretLeft size={16} weight="thin" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move right"
                        onClick={() => moveAt(index, 1)}
                        disabled={index === images.length - 1}
                        className="p-1.5 bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 disabled:opacity-40"
                      >
                        <CaretRight size={16} weight="thin" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeAt(index)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash size={16} weight="thin" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-5">
          <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Settings
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="asset-grid-cols">
                Columns
              </label>
              <input
                id="asset-grid-cols"
                type="number"
                min={1}
                max={12}
                value={cols}
                onChange={(e) => setCols(Math.min(12, parsePositiveInt(e.target.value, 1, 1)))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="asset-grid-width">
                Width (px)
              </label>
              <input
                id="asset-grid-width"
                type="number"
                min={1}
                step={10}
                value={canvasWidth}
                onChange={(e) => {
                  const next = parsePositiveInt(e.target.value, 1920, 1);
                  setCanvasWidth(next);
                  setTrim((prev) => clampTrim(prev, next, canvasHeight));
                }}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="asset-grid-height">
                Height (px)
              </label>
              <input
                id="asset-grid-height"
                type="number"
                min={1}
                step={10}
                value={canvasHeight}
                onChange={(e) => {
                  const next = parsePositiveInt(e.target.value, 1080, 1);
                  setCanvasHeight(next);
                  setTrim((prev) => clampTrim(prev, canvasWidth, next));
                }}
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={fitHeight}
                className="mt-2 text-[10px] font-mono uppercase tracking-wider text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Fit height to grid
              </button>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="asset-grid-spacing">
                Spacing (px)
              </label>
              <input
                id="asset-grid-spacing"
                type="number"
                min={0}
                max={200}
                value={spacing}
                onChange={(e) => setSpacing(Math.min(200, parsePositiveInt(e.target.value, 0, 0)))}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <p className={LABEL_CLASS}>Image fit</p>
            <div className="flex flex-wrap gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
              {FIT_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFitMode(m.id)}
                  className={`px-3 py-1.5 transition-colors ${
                    fitMode === m.id
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-mono text-stone-500 dark:text-stone-400">
              Cover crops to fill, contain keeps the full image, fill stretches.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                Trim (px)
              </p>
              <button
                type="button"
                onClick={() => setTrim(ZERO_TRIM)}
                className="text-[10px] font-mono uppercase tracking-wider text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Reset trims
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "top", label: "Top" },
                { key: "bottom", label: "Bottom" },
                { key: "left", label: "Left" },
                { key: "right", label: "Right" },
              ].map((side) => (
                <div key={side.key}>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1 text-center">
                    {side.label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={trim[side.key]}
                    onChange={(e) =>
                      setTrim((prev) =>
                        clampTrim(
                          { ...prev, [side.key]: parsePositiveInt(e.target.value, 0, 0) },
                          canvasWidth,
                          canvasHeight,
                        ),
                      )
                    }
                    className={`${INPUT_CLASS} text-center`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-mono text-stone-500 dark:text-stone-400">
              Drag handles on the composition to trim.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <Button onClick={() => save("png")} icon={DownloadSimple}>
              Save PNG
            </Button>
            <Button onClick={() => save("jpeg")} icon={DownloadSimple} variant="secondary">
              Save JPG
            </Button>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">
              {exportDims.width}×{exportDims.height}
            </span>
          </div>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
              Composition
            </h3>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">
                Base: {canvasWidth}×{canvasHeight}
              </span>
              <span className="text-[10px] font-mono text-stone-600 dark:text-stone-300 uppercase tracking-tighter">
                Export: {exportDims.width}×{exportDims.height}
              </span>
            </div>
          </div>

          <div
            ref={wrapperRef}
            className="relative border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-950 flex justify-center items-center overflow-hidden p-4 min-h-[280px] [background-image:radial-gradient(#d6d3d1_1px,transparent_1px)] dark:[background-image:radial-gradient(#44403c_1px,transparent_1px)] [background-size:16px_16px]"
          >
            <div className="relative inline-block max-w-full">
              <canvas
                ref={canvasRef}
                className="block max-w-full h-auto bg-white shadow-lg"
                style={{ maxHeight: "65vh" }}
              />
              <div
                role="slider"
                aria-label="Trim top"
                onPointerDown={(e) => startHandleDrag(e, "top")}
                className="absolute left-0 right-0 z-20 h-1.5 bg-stone-800 dark:bg-stone-200 cursor-ns-resize touch-none"
                style={{ top: handlePx.top }}
              >
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-stone-800 dark:bg-stone-200 shadow" />
              </div>
              <div
                role="slider"
                aria-label="Trim bottom"
                onPointerDown={(e) => startHandleDrag(e, "bottom")}
                className="absolute left-0 right-0 z-20 h-1.5 bg-stone-800 dark:bg-stone-200 cursor-ns-resize touch-none"
                style={{ bottom: handlePx.bottom }}
              >
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-stone-800 dark:bg-stone-200 shadow" />
              </div>
              <div
                role="slider"
                aria-label="Trim left"
                onPointerDown={(e) => startHandleDrag(e, "left")}
                className="absolute top-0 bottom-0 z-20 w-1.5 bg-stone-800 dark:bg-stone-200 cursor-ew-resize touch-none"
                style={{ left: handlePx.left }}
              >
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-stone-800 dark:bg-stone-200 shadow" />
              </div>
              <div
                role="slider"
                aria-label="Trim right"
                onPointerDown={(e) => startHandleDrag(e, "right")}
                className="absolute top-0 bottom-0 z-20 w-1.5 bg-stone-800 dark:bg-stone-200 cursor-ew-resize touch-none"
                style={{ right: handlePx.right }}
              >
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-stone-800 dark:bg-stone-200 shadow" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
