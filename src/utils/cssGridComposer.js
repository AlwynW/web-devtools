function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgba(hex, alpha) {
  const raw = String(hex || "#000000").replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.padEnd(6, "0").slice(0, 6);
  const r = Number.parseInt(full.slice(0, 2), 16) || 0;
  const g = Number.parseInt(full.slice(2, 4), 16) || 0;
  const b = Number.parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

function dashMetrics(width) {
  const w = Math.max(0.25, Number(width) || 1);
  return { dash: Math.max(w * 4, 4), gap: Math.max(w * 3, 3) };
}

function solidVertical(cell, width, color) {
  const c = Math.max(cell, width + 0.5);
  const gap = Math.max(0, c - width);
  return `repeating-linear-gradient(to right, transparent 0, transparent ${gap}px, ${color} ${gap}px, ${color} ${c}px)`;
}

function solidHorizontal(cell, width, color) {
  const c = Math.max(cell, width + 0.5);
  const gap = Math.max(0, c - width);
  return `repeating-linear-gradient(to bottom, transparent 0, transparent ${gap}px, ${color} ${gap}px, ${color} ${c}px)`;
}

function dashMaskHorizontalStripes(width) {
  const { dash, gap } = dashMetrics(width);
  const period = dash + gap;
  return `repeating-linear-gradient(to bottom, #000 0, #000 ${dash}px, transparent ${dash}px, transparent ${period}px)`;
}

function dashMaskVerticalStripes(width) {
  const { dash, gap } = dashMetrics(width);
  const period = dash + gap;
  return `repeating-linear-gradient(to right, #000 0, #000 ${dash}px, transparent ${dash}px, transparent ${period}px)`;
}

function dottedImage(cellX, cellY, color, width) {
  const r = Math.max(width * 0.65, 0.4);
  return {
    image: `radial-gradient(circle closest-side, ${color} ${r}px, transparent calc(${r}px + 0.5px))`,
    size: `${cellX}px ${cellY}px`,
  };
}

/** Sub cell size from major distance ÷ subdivision count. */
export function subCellSize(majorPx, subdivisions) {
  const major = Math.max(1, Number(majorPx) || 1);
  const divs = Math.max(2, Math.round(Number(subdivisions) || 2));
  return major / divs;
}

/**
 * Grid model for repeating-linear-gradient lines.
 * Subgrid is driven by subdivision counts (not px).
 */
export function composeGridModel({
  majorX,
  majorY,
  subEnabled,
  subdivisionsX,
  subdivisionsY,
  major,
  sub,
}) {
  const solidV = [];
  const solidH = [];
  const dashedV = [];
  const dashedH = [];
  const dots = [];
  let dashedVMask = null;
  let dashedHMask = null;

  const add = (cellX, cellY, line) => {
    const color = hexToRgba(line.color, line.opacity);
    const width = Math.max(0.25, Number(line.width) || 1);
    const cx = Math.max(1, Number(cellX) || 1);
    const cy = Math.max(1, Number(cellY) || 1);

    if (line.style === "dotted") {
      dots.push(dottedImage(cx, cy, color, width));
      return;
    }

    if (line.style === "dashed") {
      dashedV.push(solidVertical(cx, width, color));
      dashedH.push(solidHorizontal(cy, width, color));
      if (!dashedVMask) dashedVMask = dashMaskHorizontalStripes(width);
      if (!dashedHMask) dashedHMask = dashMaskVerticalStripes(width);
      return;
    }

    solidV.push(solidVertical(cx, width, color));
    solidH.push(solidHorizontal(cy, width, color));
  };

  if (subEnabled) {
    const sx = subCellSize(majorX, subdivisionsX);
    const sy = subCellSize(majorY, subdivisionsY);
    if (sx > 0 && sy > 0) add(sx, sy, sub);
  }
  add(majorX, majorY, major);

  return {
    solidV,
    solidH,
    dashedV,
    dashedH,
    dashedVMask,
    dashedHMask,
    dots,
  };
}

export function buildTransformCss({ rotateX, rotateY, rotateZ }) {
  const parts = [];
  if (rotateX) parts.push(`rotateX(${rotateX}deg)`);
  if (rotateY) parts.push(`rotateY(${rotateY}deg)`);
  if (rotateZ) parts.push(`rotateZ(${rotateZ}deg)`);
  return parts.length ? parts.join(" ") : "none";
}

function planeBackgroundCss(model) {
  const images = [
    ...model.dots.map((d) => d.image),
    ...model.solidV,
    ...model.solidH,
  ];
  const sizes = [
    ...model.dots.map((d) => d.size),
    ...model.solidV.map(() => "auto"),
    ...model.solidH.map(() => "auto"),
  ];
  if (!images.length) return [];
  const lines = [`  background-image: ${images.join(", ")};`];
  if (sizes.some((s) => s !== "auto")) {
    lines.push(`  background-size: ${sizes.join(", ")};`);
  }
  lines.push(`  background-repeat: repeat;`);
  return lines;
}

function pseudoLinesCss(selector, images, mask) {
  if (!images.length) return "";
  const lines = [
    `${selector} {`,
    `  content: "";`,
    `  position: absolute;`,
    `  inset: 0;`,
    `  pointer-events: none;`,
    `  background-image: ${images.join(", ")};`,
    `  background-repeat: repeat;`,
  ];
  if (mask) {
    lines.push(`  -webkit-mask-image: ${mask};`);
    lines.push(`  mask-image: ${mask};`);
    lines.push(`  -webkit-mask-repeat: repeat;`);
    lines.push(`  mask-repeat: repeat;`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

function buildPlaneBlock({ planeClass, model, enable3d, transform }) {
  const lines = [`.${planeClass} {`, `  position: absolute;`];
  if (enable3d) {
    lines.push(`  inset: -40%;`);
    lines.push(`  transform: ${transform};`);
    lines.push(`  transform-origin: 50% 50%;`);
  } else {
    lines.push(`  inset: 0;`);
  }
  lines.push(...planeBackgroundCss(model));
  lines.push(`}`);
  return lines.join("\n");
}

export function buildComposerCss({
  className = "grid-composer",
  sceneClass = "grid-composer__scene",
  planeClass = "grid-composer__plane",
  bgColor,
  model,
  enable3d = false,
  perspective,
  originX,
  originY,
  rotateX,
  rotateY,
  rotateZ,
}) {
  const ox = clamp(originX, 0, 100);
  const oy = clamp(originY, 0, 100);
  const transform = buildTransformCss({ rotateX, rotateY, rotateZ });

  const parts = [
    `.${className} {
  position: relative;
  overflow: hidden;
  background: ${bgColor};
}`,
  ];

  if (enable3d) {
    parts.push(`.${sceneClass} {
  position: absolute;
  inset: 0;
  perspective: ${perspective}px;
  perspective-origin: ${ox}% ${oy}%;
  overflow: hidden;
}`);
  }

  parts.push(buildPlaneBlock({ planeClass, model, enable3d, transform }));
  parts.push(
    pseudoLinesCss(`.${planeClass}::before`, model.dashedV, model.dashedVMask),
  );
  parts.push(
    pseudoLinesCss(`.${planeClass}::after`, model.dashedH, model.dashedHMask),
  );

  return parts.filter(Boolean).join("\n\n");
}

function overlayStyle(images, mask) {
  if (!images.length) return null;
  return {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: images.join(", "),
    backgroundRepeat: "repeat",
    ...(mask
      ? {
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskRepeat: "repeat",
          maskRepeat: "repeat",
        }
      : {}),
  };
}

/** Inline styles for the live preview (clip → scene → plane). */
export function previewStyles(
  model,
  { enable3d = false, rotateX, rotateY, rotateZ },
) {
  const images = [
    ...model.dots.map((d) => d.image),
    ...model.solidV,
    ...model.solidH,
  ];
  const sizes = [
    ...model.dots.map((d) => d.size),
    ...model.solidV.map(() => "auto"),
    ...model.solidH.map(() => "auto"),
  ];

  const plane = enable3d
    ? {
        position: "absolute",
        inset: "-40%",
        transform:
          [
            rotateX ? `rotateX(${rotateX}deg)` : null,
            rotateY ? `rotateY(${rotateY}deg)` : null,
            rotateZ ? `rotateZ(${rotateZ}deg)` : null,
          ]
            .filter(Boolean)
            .join(" ") || "none",
        transformOrigin: "50% 50%",
      }
    : {
        position: "absolute",
        inset: 0,
      };

  if (images.length) {
    plane.backgroundImage = images.join(", ");
    if (sizes.some((s) => s !== "auto")) {
      plane.backgroundSize = sizes.join(", ");
    }
    plane.backgroundRepeat = "repeat";
  }

  return {
    plane,
    vertical: overlayStyle(model.dashedV, model.dashedVMask),
    horizontal: overlayStyle(model.dashedH, model.dashedHMask),
  };
}

export { hexToRgba, clamp };
