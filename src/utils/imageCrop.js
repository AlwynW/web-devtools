const MIN_SIZE = 8;

export function defaultSides(imgW, imgH) {
  return {
    left: imgW * 0.15,
    top: imgH * 0.15,
    right: imgW * 0.15,
    bottom: imgH * 0.15,
  };
}

export function defaultCircle(imgW, imgH) {
  const size = Math.min(imgW, imgH) * 0.7;
  return {
    cx: imgW / 2,
    cy: imgH / 2,
    width: size,
    height: size,
    scale: 1,
  };
}

export function rectFromSides(sides, imgW, imgH) {
  return {
    x: sides.left,
    y: sides.top,
    w: imgW - sides.left - sides.right,
    h: imgH - sides.top - sides.bottom,
  };
}

export function ellipseRadii(circle) {
  return {
    rx: (circle.width * circle.scale) / 2,
    ry: (circle.height * circle.scale) / 2,
  };
}

export function clampSides(sides, imgW, imgH, min = MIN_SIZE) {
  let left = Math.max(0, sides.left);
  let top = Math.max(0, sides.top);
  let right = Math.max(0, sides.right);
  let bottom = Math.max(0, sides.bottom);
  if (imgW - left - right < min) {
    right = Math.max(0, imgW - left - min);
    if (imgW - left - right < min) {
      left = Math.max(0, imgW - min);
      right = Math.max(0, imgW - left - min);
    }
  }
  if (imgH - top - bottom < min) {
    bottom = Math.max(0, imgH - top - min);
    if (imgH - top - bottom < min) {
      top = Math.max(0, imgH - min);
      bottom = Math.max(0, imgH - top - min);
    }
  }
  return { left, top, right, bottom };
}

export function moveSides(sides, dx, dy, imgW, imgH) {
  const w = imgW - sides.left - sides.right;
  const h = imgH - sides.top - sides.bottom;
  const left = Math.max(0, Math.min(sides.left + dx, imgW - w));
  const top = Math.max(0, Math.min(sides.top + dy, imgH - h));
  return {
    left,
    top,
    right: imgW - left - w,
    bottom: imgH - top - h,
  };
}

export function clampCircle(circle, imgW, imgH) {
  return {
    cx: Math.max(0, Math.min(imgW, circle.cx)),
    cy: Math.max(0, Math.min(imgH, circle.cy)),
    width: Math.max(MIN_SIZE, circle.width),
    height: Math.max(MIN_SIZE, circle.height),
    scale: Math.max(0.05, Math.min(8, circle.scale)),
  };
}

export function rectToPoints(sides, imgW, imgH) {
  const r = rectFromSides(sides, imgW, imgH);
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x, y: r.y + r.h },
  ];
}

export function ellipseToPoints(circle, count = 12) {
  const { rx, ry } = ellipseRadii(circle);
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    pts.push({
      x: circle.cx + Math.cos(a) * rx,
      y: circle.cy + Math.sin(a) * ry,
    });
  }
  return pts;
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

export function closestEdgeIndex(p, points) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i += 1) {
    const d = distToSegment(p, points[i], points[(i + 1) % points.length]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return { index: best, dist: bestD };
}

export function pointInPolygon(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
    const xi = pts[i].x;
    const yi = pts[i].y;
    const xj = pts[j].x;
    const yj = pts[j].y;
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInEllipse(p, circle) {
  const { rx, ry } = ellipseRadii(circle);
  if (rx <= 0 || ry <= 0) return false;
  const dx = (p.x - circle.cx) / rx;
  const dy = (p.y - circle.cy) / ry;
  return dx * dx + dy * dy <= 1;
}

export function pointInRect(p, sides, imgW, imgH) {
  const r = rectFromSides(sides, imgW, imgH);
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

export function movePoints(points, dx, dy, imgW, imgH) {
  return points.map((pt) => ({
    x: Math.max(0, Math.min(imgW, pt.x + dx)),
    y: Math.max(0, Math.min(imgH, pt.y + dy)),
  }));
}

export function clampPoint(p, imgW, imgH) {
  return {
    x: Math.max(0, Math.min(imgW, p.x)),
    y: Math.max(0, Math.min(imgH, p.y)),
  };
}

export function shapeBounds(mode, { sides, circle, points }, imgW, imgH) {
  if (mode === "rect") {
    const r = rectFromSides(sides, imgW, imgH);
    return { x: r.x, y: r.y, w: r.w, h: r.h };
  }
  if (mode === "circle") {
    const { rx, ry } = ellipseRadii(circle);
    return {
      x: circle.cx - rx,
      y: circle.cy - ry,
      w: rx * 2,
      h: ry * 2,
    };
  }
  if (!points.length) return { x: 0, y: 0, w: imgW, h: imgH };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of points) {
    minX = Math.min(minX, pt.x);
    minY = Math.min(minY, pt.y);
    maxX = Math.max(maxX, pt.x);
    maxY = Math.max(maxY, pt.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function intersectBounds(b, imgW, imgH) {
  const x = Math.max(0, Math.floor(b.x));
  const y = Math.max(0, Math.floor(b.y));
  const right = Math.min(imgW, Math.ceil(b.x + b.w));
  const bottom = Math.min(imgH, Math.ceil(b.y + b.h));
  return {
    x,
    y,
    w: Math.max(1, right - x),
    h: Math.max(1, bottom - y),
  };
}

export function canCrop(mode, points) {
  if (mode === "polygon") return points.length >= 3;
  return true;
}

function applyPath(ctx, mode, sides, circle, points, imgW, imgH) {
  ctx.beginPath();
  if (mode === "rect") {
    const r = rectFromSides(sides, imgW, imgH);
    ctx.rect(r.x, r.y, r.w, r.h);
    return true;
  }
  if (mode === "circle") {
    const { rx, ry } = ellipseRadii(circle);
    if (rx <= 0 || ry <= 0) return false;
    ctx.ellipse(circle.cx, circle.cy, rx, ry, 0, 0, Math.PI * 2);
    return true;
  }
  if (points.length < 3) return false;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  return true;
}

/**
 * @param {CanvasImageSource} img
 * @param {{
 *   mode: 'rect' | 'circle' | 'polygon',
 *   sides: {left:number,top:number,right:number,bottom:number},
 *   circle: {cx:number,cy:number,width:number,height:number,scale:number},
 *   points: {x:number,y:number}[],
 *   imgW: number,
 *   imgH: number,
 *   fillMode: 'transparent' | 'color',
 *   fillColor: string,
 *   keepFullSize: boolean,
 * }} options
 */
export function renderCrop(img, options) {
  const {
    mode,
    sides,
    circle,
    points,
    imgW,
    imgH,
    fillMode,
    fillColor,
    keepFullSize,
  } = options;

  if (!canCrop(mode, points)) return null;

  const raw = keepFullSize
    ? { x: 0, y: 0, w: imgW, h: imgH }
    : shapeBounds(mode, { sides, circle, points }, imgW, imgH);
  const bounds = intersectBounds(raw, imgW, imgH);

  const canvas = document.createElement("canvas");
  canvas.width = bounds.w;
  canvas.height = bounds.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (fillMode === "color") {
    ctx.fillStyle = fillColor || "#ffffff";
    ctx.fillRect(0, 0, bounds.w, bounds.h);
  } else {
    ctx.clearRect(0, 0, bounds.w, bounds.h);
  }

  ctx.save();
  ctx.translate(-bounds.x, -bounds.y);
  if (!applyPath(ctx, mode, sides, circle, points, imgW, imgH)) {
    ctx.restore();
    return null;
  }
  ctx.clip();
  ctx.drawImage(img, 0, 0, imgW, imgH);
  ctx.restore();
  return canvas;
}
