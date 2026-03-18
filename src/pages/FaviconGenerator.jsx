import { useState, useRef, useEffect } from "react";
import { DownloadSimple } from "phosphor-react";

const SIZE = 32;

function drawFavicon(canvas, mode, text, emoji, fgColor, bgColor) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = fgColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (mode === "emoji") {
    ctx.font = "24px sans-serif";
    ctx.fillText(emoji || "?", SIZE / 2, SIZE / 2);
  } else {
    const displayText = (text || "F").slice(0, 2).toUpperCase();
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(displayText, SIZE / 2, SIZE / 2);
  }
}

export default function FaviconGenerator({ onToast }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("F");
  const [emoji, setEmoji] = useState("🔥");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFavicon(canvas, mode, text, emoji, fgColor, bgColor);
  }, [mode, text, emoji, fgColor, bgColor]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicon.png";
    a.click();
    onToast?.("PNG downloaded!");
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Favicon Generator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Generate favicons from text or emoji (PNG output).
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          <button
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
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-stone-600 dark:text-stone-300">
              Background
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-stone-500">{bgColor}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="p-4 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 w-fit">
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="block"
              style={{ imageRendering: "pixelated", width: 64, height: 64 }}
            />
          </div>
          <button
            onClick={downloadPng}
            className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
          >
            <DownloadSimple size={16} weight="thin" /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
