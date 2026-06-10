import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import CopyPre from "../components/CopyPre";

const PRESETS = [
  { name: "ease", v: [0.25, 0.1, 0.25, 1] },
  { name: "ease-in", v: [0.42, 0, 1, 1] },
  { name: "ease-out", v: [0, 0, 0.58, 1] },
  { name: "ease-in-out", v: [0.42, 0, 0.58, 1] },
  { name: "Material", v: [0.4, 0, 0.2, 1] },
];

/** SVG size; padding keeps r=8 handles fully inside the viewBox. */
const VIEW = 240;
const PAD = 22;
const INNER = VIEW - 2 * PAD;

/** Bezier x,y in [0,1] with y=0 bottom, y=1 top → SVG user coords (y down). */
function mapX(x) {
  return PAD + x * INNER;
}
function mapY(y) {
  return PAD + (1 - y) * INNER;
}

function cubicBezierAtT(t, p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const x = ((ax * t + bx) * t + cx) * t;
  const y = ((ay * t + by) * t + cy) * t;
  return { x, y };
}

function sampleCurve(p1x, p1y, p2x, p2y, steps = 100) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(cubicBezierAtT(t, p1x, p1y, p2x, p2y));
  }
  return pts;
}

export default function EasingEditor({ onToast }) {
  const [p1x, setP1x] = useState(0.25);
  const [p1y, setP1y] = useState(0.1);
  const [p2x, setP2x] = useState(0.25);
  const [p2y, setP2y] = useState(1);
  const [drag, setDrag] = useState(null);
  const svgRef = useRef(null);

  const css = useMemo(
    () =>
      `cubic-bezier(${p1x.toFixed(3)}, ${p1y.toFixed(3)}, ${p2x.toFixed(3)}, ${p2y.toFixed(3)})`,
    [p1x, p1y, p2x, p2y],
  );

  const pathD = useMemo(() => {
    const pts = sampleCurve(p1x, p1y, p2x, p2y, 100);
    let d = `M ${mapX(0)} ${mapY(0)}`;
    for (const p of pts) {
      d += ` L ${mapX(p.x)} ${mapY(p.y)}`;
    }
    return d;
  }, [p1x, p1y, p2x, p2y]);

  const toCoords = useCallback((clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const svgX = ((clientX - r.left) / r.width) * VIEW;
    const svgY = ((clientY - r.top) / r.height) * VIEW;
    const x = (svgX - PAD) / INNER;
    const y = 1 - (svgY - PAD) / INNER;
    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  }, []);

  useEffect(() => {
    const up = () => setDrag(null);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  const onPointerMove = (e) => {
    if (!drag) return;
    const c = toCoords(e.clientX, e.clientY);
    if (!c) return;
    if (drag === "p1") {
      setP1x(c.x);
      setP1y(c.y);
    } else {
      setP2x(c.x);
      setP2y(c.y);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Cubic bezier
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Drag handles. Copy{" "}
          <code className="text-stone-600 dark:text-stone-300">cubic-bezier</code>{" "}
          or{" "}
          <code className="text-stone-600 dark:text-stone-300">
            transition-timing-function
          </code>
          .
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                const [a, b, c, d] = p.v;
                setP1x(a);
                setP1y(b);
                setP2x(c);
                setP2y(d);
              }}
              className="px-3 py-1 text-xs font-mono border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <svg
            ref={svgRef}
            width={VIEW}
            height={VIEW}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-950 touch-none shrink-0 overflow-visible"
            onPointerMove={onPointerMove}
          >
            {/* Bounding box for the unit square */}
            <rect
              x={PAD}
              y={PAD}
              width={INNER}
              height={INNER}
              fill="none"
              stroke="currentColor"
              className="text-stone-300 dark:text-stone-600"
              strokeWidth={1}
            />
            {/* Curve under handles; arms on top so they stay visible */}
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              className="text-stone-900 dark:text-stone-100"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1={mapX(0)}
              y1={mapY(0)}
              x2={mapX(p1x)}
              y2={mapY(p1y)}
              stroke="currentColor"
              className="text-stone-400 dark:text-stone-500"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <line
              x1={mapX(1)}
              y1={mapY(1)}
              x2={mapX(p2x)}
              y2={mapY(p2y)}
              stroke="currentColor"
              className="text-stone-400 dark:text-stone-500"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            {/* Endpoints (0,0) and (1,1) */}
            <circle
              cx={mapX(0)}
              cy={mapY(0)}
              r={4}
              className="fill-stone-600 dark:fill-stone-400"
            />
            <circle
              cx={mapX(1)}
              cy={mapY(1)}
              r={4}
              className="fill-stone-600 dark:fill-stone-400"
            />
            <circle
              cx={mapX(p1x)}
              cy={mapY(p1y)}
              r={8}
              fill="currentColor"
              stroke="white"
              strokeWidth={2}
              className="text-amber-500 cursor-grab active:cursor-grabbing dark:stroke-stone-950"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag("p1");
              }}
            />
            <circle
              cx={mapX(p2x)}
              cy={mapY(p2y)}
              r={8}
              fill="currentColor"
              stroke="white"
              strokeWidth={2}
              className="text-sky-500 cursor-grab active:cursor-grabbing dark:stroke-stone-950"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag("p2");
              }}
            />
          </svg>

          <div className="flex-1 space-y-3 font-mono text-xs w-full max-w-sm">
            {[
              ["P1 x", p1x, setP1x],
              ["P1 y", p1y, setP1y],
              ["P2 x", p2x, setP2x],
              ["P2 y", p2y, setP2y],
            ].map(([label, val, set]) => (
              <label key={label} className="flex items-center gap-2">
                <span className="w-10 text-stone-500">{label}</span>
                <input
                  type="number"
                  step={0.01}
                  min={0}
                  max={1}
                  value={val}
                  onChange={(e) => set(parseFloat(e.target.value) || 0)}
                  className="flex-1 p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
            CSS
          </span>
          <CopyPre
            text={`transition-timing-function: ${css};`}
            onCopySuccess={() => onToast("Copied!")}
            title="Copy cubic-bezier"
            className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950"
            preClassName="p-4 font-mono text-sm text-stone-800 dark:text-stone-200"
          />
        </div>

        <div className="relative h-14 border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-950 rounded overflow-hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-stone-900 dark:bg-stone-100"
            style={{
              animation: "easingPreviewMove 2.2s infinite alternate",
              animationTimingFunction: css,
            }}
          />
        </div>
        <style>{`
          @keyframes easingPreviewMove {
            from { left: 4px; }
            to { left: calc(100% - 2.25rem); }
          }
        `}</style>
      </div>
    </div>
  );
}
