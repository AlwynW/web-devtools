export function drawImageFit(ctx, img, x, y, w, h, mode = "cover") {
  if (w <= 0 || h <= 0) return;

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  if (mode === "fill") {
    ctx.drawImage(img, 0, 0, iw, ih, x, y, w, h);
    return;
  }

  const imgRatio = iw / ih;
  const slotRatio = w / h;

  if (mode === "contain") {
    let renderW;
    let renderH;
    let renderX;
    let renderY;
    if (imgRatio > slotRatio) {
      renderW = w;
      renderH = w / imgRatio;
      renderX = x;
      renderY = y + (h - renderH) / 2;
    } else {
      renderH = h;
      renderW = h * imgRatio;
      renderX = x + (w - renderW) / 2;
      renderY = y;
    }
    ctx.drawImage(img, 0, 0, iw, ih, renderX, renderY, renderW, renderH);
    return;
  }

  let drawW;
  let drawH;
  let drawX;
  let drawY;
  if (imgRatio > slotRatio) {
    drawH = ih;
    drawW = ih * slotRatio;
    drawX = (iw - drawW) / 2;
    drawY = 0;
  } else {
    drawW = iw;
    drawH = iw / slotRatio;
    drawX = 0;
    drawY = (ih - drawH) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH, x, y, w, h);
}

function drawPlaceholder(ctx, width, height) {
  ctx.fillStyle = "#fafaf9";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "20px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#d6d3d1";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Ready for assets", width / 2, height / 2);
}

export function renderAssetGrid(ctx, images, options) {
  const width = options.width;
  const height = options.height;
  const cols = Math.max(1, options.cols || 1);
  const spacing = Math.max(0, options.spacing || 0);
  const fitMode = options.fitMode || "cover";

  ctx.clearRect(0, 0, width, height);
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }

  if (!images.length) {
    if (!options.background) drawPlaceholder(ctx, width, height);
    return;
  }

  const rows = Math.ceil(images.length / cols);
  const totalSpacingH = (cols - 1) * spacing;
  const totalSpacingV = (rows - 1) * spacing;
  const slotWidth = (width - totalSpacingH) / cols;
  const slotHeight = (height - totalSpacingV) / rows;

  images.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * (slotWidth + spacing);
    const y = row * (slotHeight + spacing);
    drawImageFit(ctx, item.img, x, y, slotWidth, slotHeight, fitMode);
  });
}

export function drawTrimOverlay(ctx, width, height, trim) {
  const t = Math.max(0, trim.top || 0);
  const b = Math.max(0, trim.bottom || 0);
  const l = Math.max(0, trim.left || 0);
  const r = Math.max(0, trim.right || 0);

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  if (t > 0) ctx.fillRect(0, 0, width, t);
  if (b > 0) ctx.fillRect(0, height - b, width, b);
  if (l > 0) ctx.fillRect(0, t, l, height - t - b);
  if (r > 0) ctx.fillRect(width - r, t, r, height - t - b);

  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 10]);
  ctx.strokeRect(l, t, Math.max(1, width - l - r), Math.max(1, height - t - b));
  ctx.setLineDash([]);
}

export function clampTrim(trim, width, height) {
  const minRemain = 10;
  const t = Math.max(0, Math.round(trim.top || 0));
  const b = Math.max(0, Math.round(trim.bottom || 0));
  const l = Math.max(0, Math.round(trim.left || 0));
  const r = Math.max(0, Math.round(trim.right || 0));
  return {
    top: Math.min(t, Math.max(0, height - b - minRemain)),
    bottom: Math.min(b, Math.max(0, height - t - minRemain)),
    left: Math.min(l, Math.max(0, width - r - minRemain)),
    right: Math.min(r, Math.max(0, width - l - minRemain)),
  };
}

export function exportSize(width, height, trim) {
  const t = Math.max(0, trim.top || 0);
  const b = Math.max(0, trim.bottom || 0);
  const l = Math.max(0, trim.left || 0);
  const r = Math.max(0, trim.right || 0);
  return {
    width: Math.max(1, width - l - r),
    height: Math.max(1, height - t - b),
  };
}

export function fittedHeightFromImages(images, canvasWidth, cols, spacing) {
  if (!images.length) return null;
  const safeCols = Math.max(1, cols || 1);
  const gap = Math.max(0, spacing || 0);
  const rows = Math.ceil(images.length / safeCols);
  const slotWidth = (canvasWidth - (safeCols - 1) * gap) / safeCols;
  if (slotWidth <= 0) return null;

  let aspectSum = 0;
  for (const item of images) {
    const w = item.img.naturalWidth || item.img.width || 1;
    const h = item.img.naturalHeight || item.img.height || 1;
    aspectSum += h / w;
  }
  const slotHeight = slotWidth * (aspectSum / images.length);
  return Math.max(1, Math.round(rows * slotHeight + (rows - 1) * gap));
}

export function createExportCanvas(images, options, trim, { fillWhite = false } = {}) {
  const width = options.width;
  const height = options.height;
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const ctx = source.getContext("2d");
  renderAssetGrid(ctx, images, {
    ...options,
    background: fillWhite ? "#ffffff" : undefined,
  });

  const t = Math.max(0, trim.top || 0);
  const b = Math.max(0, trim.bottom || 0);
  const l = Math.max(0, trim.left || 0);
  const r = Math.max(0, trim.right || 0);
  const outW = Math.max(1, width - l - r);
  const outH = Math.max(1, height - t - b);

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d");
  if (fillWhite) {
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, outW, outH);
  }
  octx.drawImage(source, l, t, outW, outH, 0, 0, outW, outH);
  return out;
}

export function downloadCanvas(canvas, filename, mimeType, quality) {
  return new Promise((resolve, reject) => {
    const fallback = () => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL(mimeType, quality);
      a.download = filename;
      a.click();
      resolve();
    };

    if (typeof canvas.toBlob !== "function") {
      fallback();
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          try {
            fallback();
          } catch (err) {
            reject(err);
          }
          return;
        }
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      },
      mimeType,
      quality,
    );
  });
}

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        img,
        name: file.name,
        objectUrl,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read ${file.name}`));
    };
    img.src = objectUrl;
  });
}
