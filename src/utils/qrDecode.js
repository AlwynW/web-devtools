import jsQR from "jsqr";

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function compositeOnWhite(data) {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    const inv = 1 - alpha;
    out[i] = data[i] * alpha + 255 * inv;
    out[i + 1] = data[i + 1] * alpha + 255 * inv;
    out[i + 2] = data[i + 2] * alpha + 255 * inv;
    out[i + 3] = 255;
  }
  return out;
}

export function decodeQrImageData(data, width, height) {
  if (!data || width < 21 || height < 21) return null;
  if (data.length !== width * height * 4) return null;
  const pixels = compositeOnWhite(data);
  try {
    const code = jsQR(pixels, width, height, { inversionAttempts: "attemptBoth" });
    return code?.data ?? null;
  } catch {
    return null;
  }
}

function scanSizes(width, height, edges) {
  const max = Math.max(width, height);
  const caps = [];
  for (const edge of [max, ...edges]) {
    const cap = Math.min(edge, max);
    if (cap >= 21 && !caps.includes(cap)) caps.push(cap);
  }
  return caps.map((cap) => {
    const scale = cap / max;
    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale)),
    };
  });
}

export function readQrFromDrawable(source, { edges = [1400, 900, 560, 320] } = {}) {
  const srcW = source.naturalWidth || source.videoWidth || source.width;
  const srcH = source.naturalHeight || source.videoHeight || source.height;
  if (!srcW || !srcH) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  for (const size of scanSizes(srcW, srcH, edges)) {
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.drawImage(source, 0, 0, size.width, size.height);
    const image = ctx.getImageData(0, 0, size.width, size.height);
    const text = decodeQrImageData(image.data, size.width, size.height);
    if (text) return text;
  }
  return null;
}

export function loadImageElement(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

export function qrLink(text) {
  const value = String(text ?? "").trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!LINK_PROTOCOLS.has(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function splitEscaped(body, separator) {
  const parts = [];
  let current = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\") {
      current += body[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (ch === separator) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

export function parseWifi(text) {
  const trimmed = String(text ?? "").trim();
  if (!/^WIFI:/i.test(trimmed)) return null;
  let body = trimmed.slice(5);
  if (body.endsWith(";;")) body = body.slice(0, -2);
  else if (body.endsWith(";")) body = body.slice(0, -1);

  const fields = {};
  for (const part of splitEscaped(body, ";")) {
    if (!part) continue;
    const idx = part.indexOf(":");
    if (idx <= 0) continue;
    fields[part.slice(0, idx)] = part.slice(idx + 1);
  }
  if (fields.S == null && fields.P == null && fields.T == null) return null;
  const auth = fields.T || "nopass";
  return {
    ssid: fields.S || "",
    password: fields.P || "",
    auth,
    authLabel: auth === "WPA" ? "WPA/WPA2" : auth === "WEP" ? "WEP" : auth === "nopass" ? "None" : auth,
    hidden: String(fields.H).toLowerCase() === "true",
  };
}

function vcardValue(lines, name) {
  const upper = name.toUpperCase();
  const line = lines.find((entry) => {
    const head = entry.split(":")[0]?.toUpperCase() ?? "";
    return head === upper || head.startsWith(`${upper};`);
  });
  if (!line) return "";
  const idx = line.indexOf(":");
  return idx === -1 ? "" : line.slice(idx + 1).trim();
}

export function parseVCard(text) {
  const trimmed = String(text ?? "").trim();
  if (!/^BEGIN:VCARD/i.test(trimmed)) return null;
  const unfolded = trimmed.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const address = vcardValue(lines, "ADR")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
  const card = {
    name: vcardValue(lines, "FN"),
    phone: vcardValue(lines, "TEL"),
    email: vcardValue(lines, "EMAIL"),
    org: vcardValue(lines, "ORG"),
    address,
  };
  if (!card.name && !card.phone && !card.email && !card.org && !card.address) return null;
  return card;
}

export function describeQr(text) {
  const link = qrLink(text);
  if (link) return { kind: "link", link };
  const wifi = parseWifi(text);
  if (wifi) return { kind: "wifi", wifi };
  const vcard = parseVCard(text);
  if (vcard) return { kind: "vcard", vcard };
  return { kind: "text" };
}
