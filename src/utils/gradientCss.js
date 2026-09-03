export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const isShort = normalized.length === 3;
  const full = isShort
    ? normalized
        .split("")
        .map((c) => c + c)
        .join("")
    : normalized.padEnd(6, "0").slice(0, 6);

  const r = Number.parseInt(full.slice(0, 2), 16) || 0;
  const g = Number.parseInt(full.slice(2, 4), 16) || 0;
  const b = Number.parseInt(full.slice(4, 6), 16) || 0;
  const a = clamp(alpha, 0, 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function stopToCss(stop) {
  return `${hexToRgba(stop.color, stop.alpha)} ${stop.pos}%`;
}

export function gradientToCss({
  type,
  angle,
  angleExpr,
  radialShape,
  radialSize,
  radialPos,
  stops,
}) {
  const stopList = stops.map(stopToCss).join(", ");
  const angleCss = angleExpr ?? `${angle}deg`;
  if (type === "radial") {
    return `radial-gradient(${radialShape} ${radialSize} at ${radialPos}, ${stopList})`;
  }
  if (type === "conic") {
    return `conic-gradient(from ${angleCss} at center, ${stopList})`;
  }
  return `linear-gradient(${angleCss}, ${stopList})`;
}

export const DEFAULT_STOPS = () => [
  { color: "#f43f5e", alpha: 100, pos: 0 },
  { color: "#8b5cf6", alpha: 100, pos: 50 },
  { color: "#06b6d4", alpha: 100, pos: 100 },
];
