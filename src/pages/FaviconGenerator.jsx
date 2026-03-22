import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  DownloadSimple,
  Archive,
  Image as ImageIcon,
  UploadSimple,
  Eye,
} from "phosphor-react";
import JSZip from "jszip";

const INTERNAL = 1024;
const TAB_FAVICON_SIZE = 32;
const TAB_FAVICON_LINK_ID = "utilities-tab-favicon-preview";

/**
 * Largest bold sans font size that fits inside a square of side `innerPx` (for centered fillText).
 * @param {CanvasRenderingContext2D} ctx
 */
function maxFontSizeBoldTextInSquare(ctx, text, innerPx) {
  const maxSide = Math.max(8, innerPx);
  const margin = 0.992;

  const fits = (fontSize) => {
    ctx.font = `bold ${fontSize}px sans-serif`;
    const m = ctx.measureText(text);
    if (m.width > maxSide * margin) return false;
    const a = m.actualBoundingBoxAscent;
    const d = m.actualBoundingBoxDescent;
    if (
      a != null &&
      d != null &&
      Number.isFinite(a) &&
      Number.isFinite(d) &&
      (a > 0 || d > 0)
    ) {
      return a + d <= maxSide * margin;
    }
    return fontSize * 0.88 <= maxSide * margin;
  };

  let lo = 8;
  let hi = Math.min(Math.ceil(maxSide * 1.35), 2048);
  let best = lo;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (fits(mid)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

/** `textBaseline: "middle"` does not match ink center; use alphabetic + this y. */
function yBaselineForVerticalInkCenter(ctx, text, canvasSize) {
  const m = ctx.measureText(text);
  const a = m.actualBoundingBoxAscent;
  const d = m.actualBoundingBoxDescent;
  if (a != null && d != null && Number.isFinite(a) && Number.isFinite(d) && (a > 0 || d > 0)) {
    return canvasSize / 2 + (a - d) / 2;
  }
  return canvasSize / 2;
}

/** Offset x when `textAlign: "center"` so the ink box is optically centered. */
function xCenterForInk(ctx, text, canvasSize) {
  const m = ctx.measureText(text);
  const L = m.actualBoundingBoxLeft;
  const R = m.actualBoundingBoxRight;
  if (L != null && R != null && Number.isFinite(L) && Number.isFinite(R)) {
    return canvasSize / 2 - (R - L) / 2;
  }
  return canvasSize / 2;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} paddingPct Inset on each side as percent of canvas width (0–40).
 * @param {number} borderRadiusPct 0–100 maps to corner radius 0 … size/2 (100 = circular).
 */
function drawGenerated(
  canvas,
  size,
  mode,
  text,
  emoji,
  fgColor,
  bgColor,
  paddingPct,
  transparentBg,
  borderRadiusPct,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = size;
  canvas.height = size;

  const pct = Math.min(40, Math.max(0, paddingPct));
  const pad = Math.round((size * pct) / 100);
  const inner = Math.max(1, size - 2 * pad);

  const br = Math.min(100, Math.max(0, borderRadiusPct));
  const cornerR = (br / 100) * (size / 2);

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, size, size, cornerR);
  } else {
    ctx.rect(0, 0, size, size);
  }
  ctx.clip();

  if (!transparentBg) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  ctx.fillStyle = fgColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (mode === "emoji") {
    const em = emoji || "?";
    ctx.font = `${Math.round(inner * 0.72)}px sans-serif`;
    const x = xCenterForInk(ctx, em, size);
    const y = yBaselineForVerticalInkCenter(ctx, em, size);
    ctx.fillText(em, x, y);
  } else {
    const displayText = (text || "F").slice(0, 2).toUpperCase();
    const fontSize = maxFontSizeBoldTextInSquare(ctx, displayText, inner);
    ctx.font = `bold ${fontSize}px sans-serif`;
    const x = xCenterForInk(ctx, displayText, size);
    const y = yBaselineForVerticalInkCenter(ctx, displayText, size);
    ctx.fillText(displayText, x, y);
  }

  ctx.restore();
}

/** Center-crop cover to square */
function drawImageCover(ctx, img, size) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(size / iw, size / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
}

/** @param {HTMLCanvasElement} source @param {number} targetSize */
function scaleCanvasTo(source, targetSize) {
  const out = document.createElement("canvas");
  out.width = targetSize;
  out.height = targetSize;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, targetSize, targetSize);
  return out;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
  });
}

const WEB_SPECS = [
  { size: 16, label: "16 × 16", file: "favicon-16x16.png", hint: "Browser tab" },
  { size: 32, label: "32 × 32", file: "favicon-32x32.png", hint: "Standard favicon" },
  { size: 48, label: "48 × 48", file: "favicon-48x48.png", hint: "Windows site icon" },
  { size: 180, label: "180 × 180", file: "apple-touch-icon.png", hint: "iOS home screen / PWA" },
];

const ANDROID_SPECS = [
  { size: 48, label: "48", file: "android-mdpi-48.png", hint: "mdpi" },
  { size: 72, label: "72", file: "android-hdpi-72.png", hint: "hdpi" },
  { size: 96, label: "96", file: "android-xhdpi-96.png", hint: "xhdpi" },
  { size: 144, label: "144", file: "android-xxhdpi-144.png", hint: "xxhdpi" },
  { size: 192, label: "192", file: "android-xxxhdpi-192.png", hint: "xxxhdpi" },
  { size: 512, label: "512", file: "android-512.png", hint: "Play / adaptive" },
];

const IOS_SPECS = [
  { size: 20, label: "20", file: "ios-20.png", hint: "Notification @1×" },
  { size: 29, label: "29", file: "ios-29.png", hint: "Settings @1×" },
  { size: 40, label: "40", file: "ios-40.png", hint: "20 @2× / Spotlight" },
  { size: 58, label: "58", file: "ios-58.png", hint: "29 @2×" },
  { size: 60, label: "60", file: "ios-60.png", hint: "20 @3×" },
  { size: 76, label: "76", file: "ios-76.png", hint: "iPad @1×" },
  { size: 80, label: "80", file: "ios-80.png", hint: "40 @2×" },
  { size: 87, label: "87", file: "ios-87.png", hint: "29 @3×" },
  { size: 120, label: "120", file: "ios-120.png", hint: "40 @3× / 60 @2×" },
  { size: 152, label: "152", file: "ios-152.png", hint: "76 @2× iPad" },
  { size: 167, label: "167", file: "ios-167.png", hint: "83.5 @2× iPad Pro" },
  { size: 180, label: "180", file: "ios-180.png", hint: "60 @3× iPhone" },
  { size: 1024, label: "1024", file: "ios-1024.png", hint: "App Store" },
];

const CHECKERBOARD_CLASS =
  "inline-block rounded-sm [background:repeating-conic-gradient(#d6d3d1_0%_25%,#fafaf9_0%_50%)] [background-size:10px_10px] dark:[background:repeating-conic-gradient(#44403c_0%_25%,#1c1917_0%_50%)]";

function SizePreview({ sourceRef, spec, maxPreviewPx, drawKey, checkerboard }) {
  const ref = useRef(null);

  useEffect(() => {
    const source = sourceRef.current;
    const canvas = ref.current;
    if (!canvas || !source || source.width < 1) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = spec.size;
    canvas.width = s;
    canvas.height = s;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, s, s);
  }, [sourceRef, spec.size, drawKey]);

  const display = Math.min(maxPreviewPx, spec.size, 128);
  const canvas = (
    <canvas
      ref={ref}
      className={`block border border-stone-200 dark:border-stone-700 ${checkerboard ? "" : "bg-stone-50 dark:bg-stone-950"}`}
      style={{
        imageRendering: spec.size <= 64 ? "pixelated" : "auto",
        width: display,
        height: display,
      }}
    />
  );
  if (checkerboard) {
    return <span className={CHECKERBOARD_CLASS}>{canvas}</span>;
  }
  return canvas;
}

export default function FaviconGenerator({ onToast }) {
  const masterRef = useRef(null);
  const fileInputRef = useRef(null);

  const [sourceKind, setSourceKind] = useState("generate");
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("F");
  const [emoji, setEmoji] = useState("🔥");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [paddingPercent, setPaddingPercent] = useState(0);
  const [borderRadiusPercent, setBorderRadiusPercent] = useState(0);
  const [transparentBg, setTransparentBg] = useState(false);

  const [uploadObjectUrl, setUploadObjectUrl] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const [outputScope, setOutputScope] = useState("web");
  const [tabPreview, setTabPreview] = useState(false);
  const previewRef = useRef(null);
  const tabPreviewBlobUrlRef = useRef(null);

  const drawKey = useMemo(
    () =>
      sourceKind === "generate"
        ? `g:${mode}:${text}:${emoji}:${fgColor}:${bgColor}:${paddingPercent}:${borderRadiusPercent}:${transparentBg}`
        : `u:${uploadObjectUrl ?? ""}:${uploadImage?.naturalWidth ?? 0}`,
    [
      sourceKind,
      mode,
      text,
      emoji,
      fgColor,
      bgColor,
      paddingPercent,
      borderRadiusPercent,
      transparentBg,
      uploadObjectUrl,
      uploadImage,
    ],
  );

  useEffect(() => {
    return () => {
      if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
    };
  }, [uploadObjectUrl]);

  const cleanupTabPreview = useCallback(() => {
    const link = document.getElementById(TAB_FAVICON_LINK_ID);
    if (link) link.remove();
    if (tabPreviewBlobUrlRef.current) {
      URL.revokeObjectURL(tabPreviewBlobUrlRef.current);
      tabPreviewBlobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupTabPreview();
  }, [cleanupTabPreview]);

  useEffect(() => {
    const canvas = masterRef.current;
    if (!canvas) return;

    if (sourceKind === "generate") {
      drawGenerated(
        canvas,
        INTERNAL,
        mode,
        text,
        emoji,
        fgColor,
        bgColor,
        paddingPercent,
        transparentBg,
        borderRadiusPercent,
      );
    } else if (sourceKind === "upload" && uploadImage?.complete && uploadImage.naturalWidth > 0) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = INTERNAL;
      canvas.height = INTERNAL;
      drawImageCover(ctx, uploadImage, INTERNAL);
    } else {
      return;
    }

    const p = previewRef.current;
    if (p && canvas.width >= 1) {
      const ctx = p.getContext("2d");
      if (ctx) {
        p.width = INTERNAL;
        p.height = INTERNAL;
        ctx.drawImage(canvas, 0, 0);
      }
    }
  }, [
    sourceKind,
    mode,
    text,
    emoji,
    fgColor,
    bgColor,
    paddingPercent,
    borderRadiusPercent,
    transparentBg,
    uploadImage,
  ]);

  useEffect(() => {
    if (!tabPreview) {
      cleanupTabPreview();
      return;
    }

    const source = masterRef.current;
    if (!source?.width) return;

    let alive = true;
    (async () => {
      try {
        const scaled = scaleCanvasTo(source, TAB_FAVICON_SIZE);
        const blob = await canvasToBlob(scaled);
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        if (tabPreviewBlobUrlRef.current) {
          URL.revokeObjectURL(tabPreviewBlobUrlRef.current);
        }
        tabPreviewBlobUrlRef.current = url;

        let link = document.getElementById(TAB_FAVICON_LINK_ID);
        if (!link) {
          link = document.createElement("link");
          link.id = TAB_FAVICON_LINK_ID;
          link.rel = "icon";
          link.type = "image/png";
          document.head.appendChild(link);
        }
        link.href = url;
      } catch {
        /* ignore */
      }
    })();

    return () => {
      alive = false;
    };
  }, [tabPreview, drawKey, cleanupTabPreview]);

  const masterReady =
    sourceKind === "generate" ||
    (sourceKind === "upload" && !!uploadImage && uploadImage.naturalWidth > 0);

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) {
      onToast?.("Use PNG, JPEG, or WebP.");
      return;
    }
    if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
    const url = URL.createObjectURL(file);
    setUploadObjectUrl(url);
    const img = new Image();
    img.onload = () => setUploadImage(img);
    img.onerror = () => {
      onToast?.("Could not read that image.");
      URL.revokeObjectURL(url);
      setUploadObjectUrl(null);
      setUploadImage(null);
    };
    img.src = url;
  };

  const clearUpload = () => {
    if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
    setUploadObjectUrl(null);
    setUploadImage(null);
  };

  const downloadOne = async (spec) => {
    const source = masterRef.current;
    if (!source?.width) {
      onToast?.("Nothing to export yet.");
      return;
    }
    const scaled = scaleCanvasTo(source, spec.size);
    const blob = await canvasToBlob(scaled);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = spec.file;
    a.click();
    URL.revokeObjectURL(a.href);
    onToast?.(`Downloaded ${spec.file}`);
  };

  const downloadZip = async () => {
    const source = masterRef.current;
    if (!source?.width) {
      onToast?.("Nothing to export yet.");
      return;
    }
    const zip = new JSZip();
    const rootName = outputScope === "web" ? "favicon-web" : "favicon-mobile";
    const root = zip.folder(rootName);
    if (!root) {
      onToast?.("Could not create ZIP.");
      return;
    }

    if (outputScope === "web") {
      for (const spec of WEB_SPECS) {
        const scaled = scaleCanvasTo(source, spec.size);
        const blob = await canvasToBlob(scaled);
        root.file(spec.file, blob);
      }
    } else {
      const andFolder = root.folder("android");
      const iosFolder = root.folder("ios");
      for (const spec of ANDROID_SPECS) {
        const scaled = scaleCanvasTo(source, spec.size);
        const blob = await canvasToBlob(scaled);
        andFolder?.file(spec.file, blob);
      }
      for (const spec of IOS_SPECS) {
        const scaled = scaleCanvasTo(source, spec.size);
        const blob = await canvasToBlob(scaled);
        iosFolder?.file(spec.file, blob);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${rootName}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    onToast?.("ZIP downloaded.");
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Favicon Generator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Text, emoji, or image → PNG sizes for web and mobile icons.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Source
          </span>
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setSourceKind("generate")}
              className={`px-3 py-1.5 transition-colors ${
                sourceKind === "generate"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Text / emoji
            </button>
            <button
              type="button"
              onClick={() => setSourceKind("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                sourceKind === "upload"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <UploadSimple size={14} weight="thin" aria-hidden />
              Image
            </button>
          </div>
        </div>

        {sourceKind === "generate" && (
          <>
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setMode("text")}
                className={`px-3 py-1.5 transition-colors ${
                  mode === "text"
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                    : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setMode("emoji")}
                className={`px-3 py-1.5 transition-colors ${
                  mode === "emoji"
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                    : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Emoji
              </button>
            </div>

            {mode === "text" && (
              <div>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                  Text (1–2 chars)
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 2))}
                  placeholder="F"
                  maxLength={2}
                  className="w-24 p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                />
              </div>
            )}

            {mode === "emoji" && (
              <div>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                  Emoji
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
                  placeholder="🔥"
                  className="w-24 p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-2xl focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100 text-center"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-3">
                <label className="text-sm font-mono text-stone-600 dark:text-stone-300">
                  Foreground
                </label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-stone-500">{fgColor}</span>
              </div>
              <div className={`flex items-center gap-3 ${transparentBg ? "opacity-40 pointer-events-none" : ""}`}>
                <label className="text-sm font-mono text-stone-600 dark:text-stone-300">
                  Background
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  disabled={transparentBg}
                  className="w-10 h-10 border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent disabled:cursor-not-allowed"
                />
                <span className="text-xs font-mono text-stone-500">{bgColor}</span>
              </div>
            </div>

            <div className="space-y-3 max-w-md">
              <div>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    Padding
                  </label>
                  <span className="text-xs font-mono text-stone-600 dark:text-stone-300 tabular-nums">
                    {paddingPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={paddingPercent}
                  onChange={(e) => setPaddingPercent(Number(e.target.value))}
                  className="w-full h-2 accent-stone-700 dark:accent-stone-300"
                />
                <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400 mt-1.5">
                  Inset around the glyph; scales with export size.
                </p>
              </div>
              <div>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    Border radius
                  </label>
                  <span className="text-xs font-mono text-stone-600 dark:text-stone-300 tabular-nums">
                    {borderRadiusPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={borderRadiusPercent}
                  onChange={(e) => setBorderRadiusPercent(Number(e.target.value))}
                  className="w-full h-2 accent-stone-700 dark:accent-stone-300"
                />
                <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400 mt-1.5">
                  0% square, 100% circular; corners outside the shape are transparent.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={transparentBg}
                  onChange={(e) => setTransparentBg(e.target.checked)}
                  className="rounded border-stone-400 text-stone-900 focus:ring-stone-500"
                />
                <span className="text-sm font-mono text-stone-700 dark:text-stone-200">
                  Transparent background
                </span>
              </label>
            </div>
          </>
        )}

        {sourceKind === "upload" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={onPickFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
              >
                <ImageIcon size={16} weight="thin" /> Choose PNG / JPEG / WebP
              </button>
              {uploadImage && (
                <button
                  type="button"
                  onClick={clearUpload}
                  className="text-[11px] font-mono text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              Square output; wide or tall images are center-cropped to fill.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center border-t border-stone-200 dark:border-stone-800 pt-6">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Export
          </span>
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setOutputScope("web")}
              className={`px-3 py-1.5 transition-colors ${
                outputScope === "web"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Web favicon
            </button>
            <button
              type="button"
              onClick={() => setOutputScope("mobile")}
              className={`px-3 py-1.5 transition-colors ${
                outputScope === "mobile"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Mobile (Android + iOS)
            </button>
          </div>
        </div>

        <canvas ref={masterRef} className="hidden" width={INTERNAL} height={INTERNAL} />

        <div className="flex flex-wrap items-start gap-8">
          <div>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Source preview ({INTERNAL} px)
            </p>
            <div className="p-4 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 w-fit max-w-[min(100%,310px)]">
              {masterReady ? (
                sourceKind === "generate" && transparentBg ? (
                  <span className={CHECKERBOARD_CLASS}>
                    <canvas
                      ref={previewRef}
                      className="block max-w-[min(100%,280px)] h-auto border border-stone-300 dark:border-stone-600"
                      style={{ imageRendering: "auto" }}
                    />
                  </span>
                ) : (
                  <canvas
                    ref={previewRef}
                    className="block max-w-[min(100%,280px)] h-auto border border-stone-300 dark:border-stone-600"
                    style={{ imageRendering: "auto" }}
                  />
                )
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-[11px] font-mono text-stone-400 border border-dashed border-stone-300 dark:border-stone-600">
                  {sourceKind === "upload" && !uploadImage ? "Choose an image" : "…"}
                </div>
              )}
            </div>
          </div>

          {masterReady && (
            <div className="max-w-sm space-y-2 pt-1">
              <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                This tab
              </p>
              <button
                type="button"
                onClick={() => setTabPreview((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 border font-mono text-xs transition-colors w-full sm:w-auto ${
                  tabPreview
                    ? "border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                    : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                }`}
              >
                <Eye size={16} weight={tabPreview ? "fill" : "thin"} aria-hidden />
                {tabPreview ? "Tab preview on" : "Preview in this tab"}
              </button>
              <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400 leading-relaxed">
                Applies your icon as this page’s favicon ({TAB_FAVICON_SIZE}×{TAB_FAVICON_SIZE} PNG) so you
                see it on the browser tab. Updates live while enabled; turn off to restore the default icon.
              </p>
            </div>
          )}
        </div>

        {masterReady && (
          <div className="space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-mono text-stone-700 dark:text-stone-300">
                {outputScope === "web"
                  ? "Web sizes"
                  : "Android & iOS — all sizes"}
              </h3>
              <button
                type="button"
                onClick={() => downloadZip()}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
              >
                <Archive size={16} weight="thin" /> Download all (ZIP)
              </button>
            </div>

            {outputScope === "mobile" && (
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-[0.14em]">
                    Android
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ANDROID_SPECS.map((spec) => (
                      <li
                        key={spec.file}
                        className="flex gap-3 items-center p-3 border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-950/50"
                      >
                        <SizePreview
                          sourceRef={masterRef}
                          spec={spec}
                          maxPreviewPx={72}
                          drawKey={drawKey}
                          checkerboard={sourceKind === "generate" && transparentBg}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-stone-800 dark:text-stone-100">
                            {spec.label} px
                          </p>
                          <p className="text-[10px] font-mono text-stone-500 truncate">{spec.hint}</p>
                          <button
                            type="button"
                            onClick={() => downloadOne(spec)}
                            className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            <DownloadSimple size={12} weight="thin" /> {spec.file}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-[0.14em]">
                    iOS
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {IOS_SPECS.map((spec) => (
                      <li
                        key={spec.file}
                        className="flex gap-3 items-center p-3 border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-950/50"
                      >
                        <SizePreview
                          sourceRef={masterRef}
                          spec={spec}
                          maxPreviewPx={spec.size > 256 ? 96 : 72}
                          drawKey={drawKey}
                          checkerboard={sourceKind === "generate" && transparentBg}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-stone-800 dark:text-stone-100">
                            {spec.label} × {spec.label}
                          </p>
                          <p className="text-[10px] font-mono text-stone-500 truncate">{spec.hint}</p>
                          <button
                            type="button"
                            onClick={() => downloadOne(spec)}
                            className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            <DownloadSimple size={12} weight="thin" /> {spec.file}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {outputScope === "web" && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WEB_SPECS.map((spec) => (
                  <li
                    key={spec.file}
                    className="flex gap-3 items-center p-3 border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-950/50"
                  >
                    <SizePreview
                      sourceRef={masterRef}
                      spec={spec}
                      maxPreviewPx={72}
                      drawKey={drawKey}
                      checkerboard={sourceKind === "generate" && transparentBg}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-stone-800 dark:text-stone-100">{spec.label}</p>
                      <p className="text-[10px] font-mono text-stone-500">{spec.hint}</p>
                      <button
                        type="button"
                        onClick={() => downloadOne(spec)}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                      >
                        <DownloadSimple size={12} weight="thin" /> {spec.file}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
