import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Circle,
  DownloadSimple,
  Polygon,
  Square,
  Trash,
  UploadSimple,
  X,
} from "phosphor-react";
import Button from "../components/Button";
import { downloadCanvas, loadImageFile } from "../utils/assetGridComposer";
import {
  canCrop,
  clampCircle,
  clampPoint,
  clampSides,
  closestEdgeIndex,
  defaultCircle,
  defaultSides,
  dist,
  ellipseRadii,
  ellipseToPoints,
  movePoints,
  moveSides,
  pointInEllipse,
  pointInPolygon,
  pointInRect,
  rectFromSides,
  rectToPoints,
  renderCrop,
} from "../utils/imageCrop";

const INPUT_CLASS =
  "w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100";

const LABEL_CLASS =
  "block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2";

const STAGE_DOTS_CLASS =
  "relative border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-950 flex justify-center items-center overflow-hidden p-4 min-h-[280px] [background-image:radial-gradient(#d6d3d1_1px,transparent_1px)] dark:[background-image:radial-gradient(#44403c_1px,transparent_1px)] [background-size:16px_16px]";

const STAGE_BASE_CLASS =
  "relative border border-stone-200 dark:border-stone-700 flex justify-center items-center overflow-hidden p-4 min-h-[280px]";

const MIN_SLIDER = 8;

const MODES = [
  { id: "rect", label: "Rect", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "polygon", label: "Polygon", icon: Polygon },
];

function parseNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              value === opt.id
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            {Icon && <Icon size={14} weight="thin" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function NumberField({ id, label, value, min, max, step = 1, onChange, center }) {
  return (
    <div>
      <label className={`${LABEL_CLASS} ${center ? "text-center" : ""}`} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseNumber(e.target.value, value, min, max))}
        className={`${INPUT_CLASS} ${center ? "text-center" : ""}`}
      />
    </div>
  );
}

function clientToImage(event, svgEl, imgW, imgH) {
  const box = svgEl.getBoundingClientRect();
  if (!box.width || !box.height) return { x: 0, y: 0 };
  return {
    x: ((event.clientX - box.left) / box.width) * imgW,
    y: ((event.clientY - box.top) / box.height) * imgH,
  };
}

function Handle({ cx, cy, r, cursor = "pointer" }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="#fafaf9"
      stroke="#1c1917"
      strokeWidth={r * 0.22}
      style={{ cursor }}
    />
  );
}

function CropOverlay({
  imgW,
  imgH,
  unit,
  mode,
  sides,
  circle,
  points,
  fillMode,
  fillColor,
  maskId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDoubleClick,
}) {
  const rect = rectFromSides(sides, imgW, imgH);
  const { rx, ry } = ellipseRadii(circle);
  const handleR = Math.max(unit * 6, 4 * unit);
  const stroke = Math.max(unit * 1.5, unit);
  const livePolygon = points.length >= 3;
  const overlayFill =
    fillMode === "color" ? fillColor : "rgba(12, 10, 9, 0.55)";
  const overlayOpacity = fillMode === "color" ? 0.82 : 1;

  let hole = null;
  if (mode === "rect") {
    hole = <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="black" />;
  } else if (mode === "circle") {
    hole = <ellipse cx={circle.cx} cy={circle.cy} rx={rx} ry={ry} fill="black" />;
  } else if (livePolygon) {
    hole = (
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="black"
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full touch-none select-none"
      viewBox={`0 0 ${imgW} ${imgH}`}
      preserveAspectRatio="none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width={imgW} height={imgH} fill="white" />
          {hole}
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width={imgW}
        height={imgH}
        fill={overlayFill}
        opacity={overlayOpacity}
        mask={`url(#${maskId})`}
        style={{ pointerEvents: "none" }}
      />

      {mode === "rect" && (
        <>
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            fill="transparent"
            stroke="#fafaf9"
            strokeWidth={stroke}
            style={{ cursor: "move" }}
          />
          <Handle cx={rect.x} cy={rect.y + rect.h / 2} r={handleR} cursor="ew-resize" />
          <Handle cx={rect.x + rect.w} cy={rect.y + rect.h / 2} r={handleR} cursor="ew-resize" />
          <Handle cx={rect.x + rect.w / 2} cy={rect.y} r={handleR} cursor="ns-resize" />
          <Handle
            cx={rect.x + rect.w / 2}
            cy={rect.y + rect.h}
            r={handleR}
            cursor="ns-resize"
          />
          <Handle cx={rect.x} cy={rect.y} r={handleR} cursor="nwse-resize" />
          <Handle cx={rect.x + rect.w} cy={rect.y} r={handleR} cursor="nesw-resize" />
          <Handle cx={rect.x} cy={rect.y + rect.h} r={handleR} cursor="nesw-resize" />
          <Handle
            cx={rect.x + rect.w}
            cy={rect.y + rect.h}
            r={handleR}
            cursor="nwse-resize"
          />
        </>
      )}

      {mode === "circle" && (
        <>
          <ellipse
            cx={circle.cx}
            cy={circle.cy}
            rx={rx}
            ry={ry}
            fill="transparent"
            stroke="#fafaf9"
            strokeWidth={stroke}
            style={{ cursor: "move" }}
          />
          <Handle cx={circle.cx - rx} cy={circle.cy} r={handleR} cursor="ew-resize" />
          <Handle cx={circle.cx + rx} cy={circle.cy} r={handleR} cursor="ew-resize" />
          <Handle cx={circle.cx} cy={circle.cy - ry} r={handleR} cursor="ns-resize" />
          <Handle cx={circle.cx} cy={circle.cy + ry} r={handleR} cursor="ns-resize" />
          <Handle
            cx={circle.cx + rx}
            cy={circle.cy + ry}
            r={handleR}
            cursor="nwse-resize"
          />
        </>
      )}

      {mode === "polygon" && (
        <>
          {points.length >= 2 && (
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#fafaf9"
              strokeWidth={stroke}
              strokeLinejoin="round"
            />
          )}
          {livePolygon && (
            <line
              x1={points[points.length - 1].x}
              y1={points[points.length - 1].y}
              x2={points[0].x}
              y2={points[0].y}
              stroke="#fafaf9"
              strokeWidth={stroke}
              strokeDasharray={`${stroke * 4} ${stroke * 3}`}
            />
          )}
          {points.map((p, i) => (
            <Handle key={`${p.x}-${p.y}-${i}`} cx={p.x} cy={p.y} r={handleR} />
          ))}
        </>
      )}
    </svg>
  );
}

export default function ImageCrop({ onToast }) {
  const maskId = `crop-mask-${useId().replace(/:/g, "")}`;
  const wrapRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const assetRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);

  const [asset, setAsset] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("rect");
  const [sides, setSides] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const [circle, setCircle] = useState({
    cx: 0,
    cy: 0,
    width: 100,
    height: 100,
    scale: 1,
  });
  const [lockCircle, setLockCircle] = useState(true);
  const [points, setPoints] = useState([]);
  const [fillMode, setFillMode] = useState("transparent");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [editorBgMode, setEditorBgMode] = useState("dots");
  const [editorBgColor, setEditorBgColor] = useState("#1c1917");
  const [keepFullSize, setKeepFullSize] = useState(false);
  const [display, setDisplay] = useState({ w: 1, h: 1 });

  const imgW = asset?.width || 1;
  const imgH = asset?.height || 1;
  const unit = display.w > 0 ? imgW / display.w : 1;

  useEffect(() => {
    assetRef.current = asset;
  }, [asset]);

  useEffect(() => {
    return () => {
      if (assetRef.current?.objectUrl) URL.revokeObjectURL(assetRef.current.objectUrl);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const sync = () => {
      const box = el.getBoundingClientRect();
      setDisplay({ w: box.width, h: box.height });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [asset]);

  const resetShapes = useCallback((w, h, nextMode = "rect") => {
    const nextSides = defaultSides(w, h);
    setSides(nextSides);
    setCircle(defaultCircle(w, h));
    setLockCircle(true);
    setPoints(nextMode === "polygon" ? rectToPoints(nextSides, w, h) : []);
  }, []);

  const processFile = useCallback(
    async (file) => {
      setError(null);
      if (!file || !file.type.startsWith("image/")) {
        setError("Please drop an image file (PNG, JPG, GIF, WebP, etc.)");
        return;
      }
      try {
        const loaded = await loadImageFile(file);
        if (assetRef.current?.objectUrl) URL.revokeObjectURL(assetRef.current.objectUrl);
        const w = loaded.img.naturalWidth || loaded.img.width;
        const h = loaded.img.naturalHeight || loaded.img.height;
        setAsset({
          img: loaded.img,
          name: loaded.name,
          objectUrl: loaded.objectUrl,
          width: w,
          height: h,
        });
        resetShapes(w, h, "rect");
        setMode("rect");
      } catch {
        setError("Could not read that image.");
      }
    },
    [resetShapes],
  );

  const clearImage = () => {
    if (asset?.objectUrl) URL.revokeObjectURL(asset.objectUrl);
    setAsset(null);
    setError(null);
    setPoints([]);
  };

  const switchMode = (next) => {
    if (!asset || next === mode) {
      setMode(next);
      return;
    }
    if (next === "polygon") {
      if (mode === "rect") setPoints(rectToPoints(sides, imgW, imgH));
      else if (mode === "circle") setPoints(ellipseToPoints(circle, 12));
    }
    setMode(next);
  };

  const hitSlop = Math.max(unit * 12, 8 * unit);

  const hitTest = (p) => {
    if (mode === "rect") {
      const r = rectFromSides(sides, imgW, imgH);
      const handles = [
        { type: "nw", x: r.x, y: r.y },
        { type: "ne", x: r.x + r.w, y: r.y },
        { type: "sw", x: r.x, y: r.y + r.h },
        { type: "se", x: r.x + r.w, y: r.y + r.h },
        { type: "w", x: r.x, y: r.y + r.h / 2 },
        { type: "e", x: r.x + r.w, y: r.y + r.h / 2 },
        { type: "n", x: r.x + r.w / 2, y: r.y },
        { type: "s", x: r.x + r.w / 2, y: r.y + r.h },
      ];
      for (const h of handles) {
        if (dist(p, h) <= hitSlop) return { kind: "rect", type: h.type };
      }
      if (pointInRect(p, sides, imgW, imgH)) return { kind: "rect", type: "move" };
      return null;
    }
    if (mode === "circle") {
      const { rx, ry } = ellipseRadii(circle);
      const handles = [
        { type: "w", x: circle.cx - rx, y: circle.cy },
        { type: "e", x: circle.cx + rx, y: circle.cy },
        { type: "n", x: circle.cx, y: circle.cy - ry },
        { type: "s", x: circle.cx, y: circle.cy + ry },
        { type: "scale", x: circle.cx + rx, y: circle.cy + ry },
      ];
      for (const h of handles) {
        if (dist(p, h) <= hitSlop) return { kind: "circle", type: h.type };
      }
      if (pointInEllipse(p, circle)) return { kind: "circle", type: "move" };
      return null;
    }
    for (let i = points.length - 1; i >= 0; i -= 1) {
      if (dist(p, points[i]) <= hitSlop) return { kind: "poly", type: "point", index: i };
    }
    if (points.length >= 3 && pointInPolygon(p, points)) {
      return { kind: "poly", type: "move" };
    }
    if (points.length >= 3) {
      const edge = closestEdgeIndex(p, points);
      if (edge.dist <= hitSlop) {
        return { kind: "poly", type: "edge", index: edge.index };
      }
    }
    return { kind: "poly", type: "add" };
  };

  const onOverlayPointerDown = (e) => {
    if (!asset) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = clientToImage(e, e.currentTarget, imgW, imgH);
    movedRef.current = false;
    const hit = hitTest(p);
    dragRef.current = {
      svg: e.currentTarget,
      start: p,
      sides,
      circle,
      points,
      lockCircle,
      hit,
    };
  };

  const onOverlayPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = clientToImage(e, drag.svg, imgW, imgH);
    const dx = p.x - drag.start.x;
    const dy = p.y - drag.start.y;
    if (Math.hypot(dx, dy) > unit * 2) movedRef.current = true;
    const hit = drag.hit;
    if (!hit) return;

    if (hit.kind === "rect") {
      if (hit.type === "move") {
        setSides(moveSides(drag.sides, dx, dy, imgW, imgH));
        return;
      }
      const next = { ...drag.sides };
      if (hit.type.includes("w")) next.left = drag.sides.left + dx;
      if (hit.type.includes("e")) next.right = drag.sides.right - dx;
      if (hit.type.includes("n")) next.top = drag.sides.top + dy;
      if (hit.type.includes("s")) next.bottom = drag.sides.bottom - dy;
      setSides(clampSides(next, imgW, imgH));
      return;
    }

    if (hit.kind === "circle") {
      if (hit.type === "move") {
        setCircle(
          clampCircle(
            { ...drag.circle, cx: drag.circle.cx + dx, cy: drag.circle.cy + dy },
            imgW,
            imgH,
          ),
        );
        return;
      }
      if (hit.type === "scale") {
        const { rx, ry } = ellipseRadii(drag.circle);
        const startR = Math.hypot(rx, ry) || 1;
        const nowR = Math.hypot(p.x - drag.circle.cx, p.y - drag.circle.cy);
        const scale = (drag.circle.scale * nowR) / startR;
        setCircle(clampCircle({ ...drag.circle, scale }, imgW, imgH));
        return;
      }
      const next = { ...drag.circle };
      if (hit.type === "e" || hit.type === "w") {
        const width = (Math.abs(p.x - drag.circle.cx) * 2) / drag.circle.scale;
        next.width = width;
        if (drag.lockCircle) next.height = width;
      } else if (hit.type === "n" || hit.type === "s") {
        const height = (Math.abs(p.y - drag.circle.cy) * 2) / drag.circle.scale;
        next.height = height;
        if (drag.lockCircle) next.width = height;
      }
      setCircle(clampCircle(next, imgW, imgH));
      return;
    }

    if (hit.kind === "poly" && hit.type === "point") {
      const next = drag.points.map((pt, i) =>
        i === hit.index ? clampPoint(p, imgW, imgH) : pt,
      );
      setPoints(next);
      return;
    }
    if (hit.kind === "poly" && hit.type === "move") {
      setPoints(movePoints(drag.points, dx, dy, imgW, imgH));
    }
  };

  const onOverlayPointerUp = (e) => {
    const drag = dragRef.current;
    const p = drag ? clientToImage(e, drag.svg, imgW, imgH) : null;
    const hit = drag?.hit;
    dragRef.current = null;

    if (mode !== "polygon" || !p || movedRef.current || e.detail > 1) return;

    if (hit?.type === "add") {
      setPoints((prev) => [...prev, clampPoint(p, imgW, imgH)]);
      return;
    }
    if (hit?.type === "edge") {
      setPoints((prev) => {
        const next = [...prev];
        next.splice(hit.index + 1, 0, clampPoint(p, imgW, imgH));
        return next;
      });
    }
  };

  const onOverlayDoubleClick = (e) => {
    if (mode !== "polygon") return;
    const p = clientToImage(e, e.currentTarget, imgW, imgH);
    const idx = points.findIndex((pt) => dist(p, pt) <= hitSlop);
    if (idx >= 0) {
      setPoints((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const cropOptions = useMemo(
    () => ({
      mode,
      sides,
      circle,
      points,
      imgW,
      imgH,
      fillMode,
      fillColor,
      keepFullSize,
    }),
    [mode, sides, circle, points, imgW, imgH, fillMode, fillColor, keepFullSize],
  );

  const exportable = canCrop(mode, points);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !asset?.img || !exportable) return;
    const cropped = renderCrop(asset.img, cropOptions);
    if (!cropped) return;
    const maxW = 520;
    const scale = Math.min(1, maxW / cropped.width);
    canvas.width = Math.max(1, Math.round(cropped.width * scale));
    canvas.height = Math.max(1, Math.round(cropped.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cropped, 0, 0, canvas.width, canvas.height);
  }, [asset, cropOptions, exportable]);

  const download = async (mimeType) => {
    if (!asset?.img || !exportable) return;
    const options =
      mimeType === "image/jpeg" && fillMode === "transparent"
        ? { ...cropOptions, fillMode: "color", fillColor: "#ffffff" }
        : cropOptions;
    const canvas = renderCrop(asset.img, options);
    if (!canvas) return;
    const base = (asset.name || "image").replace(/\.[^.]+$/, "");
    const ext = mimeType === "image/jpeg" ? "jpg" : "png";
    try {
      await downloadCanvas(
        canvas,
        `${base}-crop.${ext}`,
        mimeType,
        mimeType === "image/jpeg" ? 0.92 : undefined,
      );
      onToast?.("Crop downloaded!");
    } catch {
      setError("Failed to download image");
    }
  };

  const setCircleLocked = (patch) => {
    setCircle((prev) => {
      const next = { ...prev, ...patch };
      if (lockCircle && patch.width != null) next.height = patch.width;
      if (lockCircle && patch.height != null) next.width = patch.height;
      return clampCircle(next, imgW, imgH);
    });
  };

  const maxSideX = Math.max(MIN_SLIDER, imgW - 8);
  const maxSideY = Math.max(MIN_SLIDER, imgH - 8);
  const maxDiameter = Math.max(imgW, imgH) * 1.5;

  const stageClass =
    editorBgMode === "color" ? STAGE_BASE_CLASS : STAGE_DOTS_CLASS;
  const stageStyle =
    editorBgMode === "color" ? { backgroundColor: editorBgColor } : undefined;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Crop
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Rect, circle, or polygon crop — fill outside with color or leave it transparent.
        </p>
      </header>

      <div className="space-y-6">
        <section className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
              Image
            </h3>
            {asset && (
              <button
                type="button"
                onClick={clearImage}
                className="flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <X size={14} weight="thin" /> Clear
              </button>
            )}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed text-center cursor-pointer transition-colors ${
              asset ? "p-6" : "p-12"
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
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
                e.target.value = "";
              }}
            />
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <UploadSimple
                size={asset ? 32 : 48}
                weight="thin"
                className="text-stone-400"
              />
              <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
                {asset
                  ? `${asset.name} · ${Math.round(imgW)}×${Math.round(imgH)}`
                  : "Drop an image here or click to browse"}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
        </section>

        {asset && (
          <>
            <section className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-5">
              <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                Settings
              </h3>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className={LABEL_CLASS}>Preset</p>
                  <button
                    type="button"
                    onClick={() => resetShapes(imgW, imgH, mode)}
                    className="text-[10px] font-mono uppercase tracking-wider text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  >
                    Reset shape
                  </button>
                </div>
                <Segmented options={MODES} value={mode} onChange={switchMode} />
              </div>

              {mode === "rect" && (
                <div>
                  <p className={LABEL_CLASS}>Sides (px)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "left", label: "Left", max: maxSideX },
                      { key: "right", label: "Right", max: maxSideX },
                      { key: "top", label: "Top", max: maxSideY },
                      { key: "bottom", label: "Bottom", max: maxSideY },
                    ].map((side) => (
                      <NumberField
                        key={side.key}
                        id={`crop-side-${side.key}`}
                        label={side.label}
                        value={Math.round(sides[side.key])}
                        min={0}
                        max={side.max}
                        center
                        onChange={(v) =>
                          setSides(clampSides({ ...sides, [side.key]: v }, imgW, imgH))
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    Drag handles on the crop to resize.
                  </p>
                </div>
              )}

              {mode === "circle" && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className={LABEL_CLASS}>Ellipse</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLockCircle((v) => !v);
                        if (!lockCircle) {
                          setCircle(
                            clampCircle(
                              { ...circle, height: circle.width },
                              imgW,
                              imgH,
                            ),
                          );
                        }
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                    >
                      {lockCircle ? "Unlock width / height" : "Lock circle"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <NumberField
                      id="crop-circle-width"
                      label="Width (px)"
                      value={Math.round(circle.width)}
                      min={8}
                      max={maxDiameter}
                      onChange={(v) => setCircleLocked({ width: v })}
                    />
                    <NumberField
                      id="crop-circle-height"
                      label="Height (px)"
                      value={Math.round(circle.height)}
                      min={8}
                      max={maxDiameter}
                      onChange={(v) => setCircleLocked({ height: v })}
                    />
                    <NumberField
                      id="crop-circle-scale"
                      label="Scale"
                      value={Number(circle.scale.toFixed(2))}
                      min={0.2}
                      max={3}
                      step={0.01}
                      onChange={(v) => setCircleLocked({ scale: v })}
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    Drag the ellipse to move. Side handles change width or height; corner handle scales.
                  </p>
                </div>
              )}

              {mode === "polygon" && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className={LABEL_CLASS}>Polygon</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPoints((prev) => prev.slice(0, -1))}
                        disabled={!points.length}
                        className="text-[10px] font-mono uppercase tracking-wider text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 disabled:opacity-40"
                      >
                        Undo point
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoints([])}
                        disabled={!points.length}
                        className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-stone-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40"
                      >
                        <Trash size={12} weight="thin" />
                        Clear points
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    Click to add points. Drag to move. Click an edge to insert.
                    Double-click a point to remove.
                    {points.length < 3
                      ? ` ${3 - points.length} more needed.`
                      : ` ${points.length} points.`}
                  </p>
                </div>
              )}

              <div>
                <p className={LABEL_CLASS}>Unmasked fill</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Segmented
                    options={[
                      { id: "transparent", label: "Transparent" },
                      { id: "color", label: "Color" },
                    ]}
                    value={fillMode}
                    onChange={setFillMode}
                  />
                  {fillMode === "color" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fillColor}
                        onChange={(e) => setFillColor(e.target.value)}
                        title="Fill color"
                        className="h-9 w-12 shrink-0 cursor-pointer border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 p-0.5"
                      />
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">
                        {fillColor}
                      </span>
                    </div>
                  )}
                </div>
                <label className="mt-3 flex items-center gap-2 font-mono text-xs text-stone-600 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={keepFullSize}
                    onChange={(e) => setKeepFullSize(e.target.checked)}
                    className="accent-stone-800 dark:accent-stone-200"
                  />
                  Keep original image size
                </label>
              </div>

              <div>
                <p className={LABEL_CLASS}>Editor background</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Segmented
                    options={[
                      { id: "dots", label: "Grid" },
                      { id: "color", label: "Color" },
                    ]}
                    value={editorBgMode}
                    onChange={setEditorBgMode}
                  />
                  {editorBgMode === "color" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editorBgColor}
                        onChange={(e) => setEditorBgColor(e.target.value)}
                        title="Editor background color"
                        className="h-9 w-12 shrink-0 cursor-pointer border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 p-0.5"
                      />
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">
                        {editorBgColor}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button onClick={() => download("image/png")} icon={DownloadSimple}>
                  Save PNG
                </Button>
                <Button onClick={() => download("image/jpeg")} icon={DownloadSimple}>
                  Save JPG
                </Button>
                {exportable && (
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">
                    {Math.round(imgW)}×{Math.round(imgH)}
                  </span>
                )}
              </div>
            </section>

            <section className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                  Crop
                </h3>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">
                  {asset.name} · {Math.round(imgW)}×{Math.round(imgH)}
                </span>
              </div>

              <div className={stageClass} style={stageStyle}>
                <div ref={wrapRef} className="relative inline-block max-w-full">
                  <img
                    src={asset.objectUrl}
                    alt="Crop source"
                    draggable={false}
                    className="block max-w-full h-auto select-none shadow-lg bg-white"
                    style={{ maxHeight: "65vh" }}
                  />
                  {display.w > 2 && (
                    <CropOverlay
                      imgW={imgW}
                      imgH={imgH}
                      unit={unit}
                      mode={mode}
                      sides={sides}
                      circle={circle}
                      points={points}
                      fillMode={fillMode}
                      fillColor={fillColor}
                      maskId={maskId}
                      onPointerDown={onOverlayPointerDown}
                      onPointerMove={onOverlayPointerMove}
                      onPointerUp={onOverlayPointerUp}
                      onDoubleClick={onOverlayDoubleClick}
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    Result
                  </h3>
                </div>
                {exportable ? (
                  <div className={stageClass} style={stageStyle}>
                    <canvas
                      ref={previewRef}
                      className="max-w-full h-auto shadow-lg bg-white"
                      style={{ maxHeight: "40vh" }}
                    />
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    Add at least three polygon points to preview the crop.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
