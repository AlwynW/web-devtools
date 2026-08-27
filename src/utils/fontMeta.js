import { getTable, readSfnt, unwrapToSfnt } from "./fontSfnt.js";

export const WEIGHT_OPTIONS = [
  { value: 100, label: "100 Thin" },
  { value: 200, label: "200 Extra Light" },
  { value: 300, label: "300 Light" },
  { value: 400, label: "400 Regular" },
  { value: 500, label: "500 Medium" },
  { value: 600, label: "600 Semibold" },
  { value: 700, label: "700 Bold" },
  { value: 800, label: "800 Extra Bold" },
  { value: 900, label: "900 Black" },
];

export const STYLE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
  { value: "oblique", label: "Oblique" },
];

const WEIGHT_FROM_NAME = [
  [/ultra\s*black|extra\s*black/i, 950],
  [/ultra\s*bold|extra\s*bold/i, 800],
  [/semi[\s-]*bold|demi[\s-]*bold/i, 600],
  [/extra[\s-]*light|ultra[\s-]*light/i, 200],
  [/hairline|thin/i, 100],
  [/light/i, 300],
  [/medium/i, 500],
  [/black|heavy/i, 900],
  [/bold/i, 700],
  [/regular|normal|book/i, 400],
];

const STYLE_TAIL =
  /(?:[\s._-]+(?:thin|hairline|extra-?light|ultra-?light|light|regular|normal|book|medium|semi-?bold|demi-?bold|bold|extra-?bold|ultra-?bold|black|heavy|italic|ital|oblique|obliq|variable|vf|upright))*\s*$/i;

function stripNulls(text) {
  let end = text.length;
  while (end > 0 && text.charCodeAt(end - 1) === 0) end -= 1;
  return text.slice(0, end);
}

function decodeUtf16Be(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let out = "";
  for (let i = 0; i + 1 < bytes.byteLength; i += 2) {
    out += String.fromCharCode(view.getUint16(i, false));
  }
  return stripNulls(out);
}

function decodeLatin1(bytes) {
  let out = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return stripNulls(out);
}

function nameRecordScore(platformID, encodingID, languageID) {
  if (platformID === 3 && encodingID === 1 && languageID === 0x0409) return 100;
  if (platformID === 3 && (encodingID === 1 || encodingID === 10)) return 80;
  if (platformID === 0) return 60;
  if (platformID === 3) return 40;
  return 10;
}

function parseNameTable(bytes) {
  if (!bytes || bytes.byteLength < 6) return {};
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint16(2, false);
  const stringOffset = view.getUint16(4, false);
  const best = new Map();
  for (let i = 0; i < count; i += 1) {
    const rec = 6 + i * 12;
    if (rec + 12 > bytes.byteLength) break;
    const platformID = view.getUint16(rec, false);
    const encodingID = view.getUint16(rec + 2, false);
    const languageID = view.getUint16(rec + 4, false);
    const nameID = view.getUint16(rec + 6, false);
    const length = view.getUint16(rec + 8, false);
    const offset = view.getUint16(rec + 10, false);
    const start = stringOffset + offset;
    if (start + length > bytes.byteLength) continue;
    const slice = new Uint8Array(bytes.buffer, bytes.byteOffset + start, length);
    const unicode = platformID === 0 || platformID === 3;
    const text = (unicode ? decodeUtf16Be(slice) : decodeLatin1(slice)).trim();
    if (!text) continue;
    const score = nameRecordScore(platformID, encodingID, languageID);
    const prev = best.get(nameID);
    if (!prev || score > prev.score) best.set(nameID, { text, score });
  }
  const names = {};
  for (const [id, rec] of best) names[id] = rec.text;
  return names;
}

function snapWeight(value) {
  if (!Number.isFinite(value) || value <= 0) return 400;
  const clamped = Math.min(1000, Math.max(1, value));
  return Math.min(900, Math.max(100, Math.round(clamped / 100) * 100));
}

function weightFromText(text) {
  if (!text) return null;
  for (const [re, weight] of WEIGHT_FROM_NAME) {
    if (re.test(text)) return snapWeight(weight);
  }
  return null;
}

function styleFromText(text) {
  if (!text) return null;
  if (/oblique/i.test(text)) return "oblique";
  if (/italic|\bital\b/i.test(text)) return "italic";
  return null;
}

export function stripStyleFromName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "";
  const stripped = trimmed.replace(STYLE_TAIL, "").replace(/[\s._-]+$/g, "").trim();
  return stripped || trimmed;
}

export function familyFromFilename(fileName) {
  const stem = fileName.replace(/\.(ttf|otf|woff2?)$/i, "");
  return stripStyleFromName(stem.replace(/[_]+/g, " ")) || stem || "Untitled";
}

function parseOs2(bytes) {
  if (!bytes || bytes.byteLength < 8) return {};
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const usWeightClass = view.getUint16(4, false);
  let italic = false;
  let oblique = false;
  if (bytes.byteLength >= 64) {
    const fsSelection = view.getUint16(62, false);
    italic = Boolean(fsSelection & 0x01);
    oblique = Boolean(fsSelection & 0x200);
  }
  return { usWeightClass, italic, oblique };
}

function parseHead(bytes) {
  if (!bytes || bytes.byteLength < 46) return {};
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const macStyle = view.getUint16(44, false);
  return {
    italic: Boolean(macStyle & 0x02),
    bold: Boolean(macStyle & 0x01),
  };
}

function parseMaxp(bytes) {
  if (!bytes || bytes.byteLength < 6) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(4, false);
}

function readFixed(view, offset) {
  return view.getInt32(offset, false) / 65536;
}

function parseFvar(bytes) {
  if (!bytes || bytes.byteLength < 16) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const axisCount = view.getUint16(8, false);
  const axisSize = view.getUint16(10, false);
  const axisOffset = view.getUint16(4, false);
  if (!axisCount || axisSize < 20) return null;
  const axes = {};
  for (let i = 0; i < axisCount; i += 1) {
    const off = axisOffset + i * axisSize;
    if (off + 20 > bytes.byteLength) break;
    const tag = String.fromCharCode(
      view.getUint8(off),
      view.getUint8(off + 1),
      view.getUint8(off + 2),
      view.getUint8(off + 3),
    );
    axes[tag] = {
      min: readFixed(view, off + 4),
      defaultValue: readFixed(view, off + 8),
      max: readFixed(view, off + 12),
    };
  }
  return axes;
}

export function parseFontMeta(sfnt, fileName = "") {
  const parsed = readSfnt(sfnt);
  const names = parseNameTable(getTable(parsed, "name"));
  const os2 = parseOs2(getTable(parsed, "OS/2"));
  const head = parseHead(getTable(parsed, "head"));
  const glyphCount = parseMaxp(getTable(parsed, "maxp"));
  const axes = parseFvar(getTable(parsed, "fvar"));
  const subfamily = names[17] || names[2] || "";
  const fullName = names[4] || "";
  const postscriptName = names[6] || "";
  const typographicFamily = names[16] || "";
  const nameFamily = names[1] || "";
  const familyGuess =
    typographicFamily ||
    stripStyleFromName(nameFamily) ||
    familyFromFilename(fileName) ||
    "Untitled";

  const fromOs2 = os2.usWeightClass ? snapWeight(os2.usWeightClass) : null;
  const weight =
    fromOs2 ||
    weightFromText(subfamily) ||
    weightFromText(fullName) ||
    weightFromText(fileName) ||
    400;

  let style = "normal";
  if (os2.oblique) style = "oblique";
  else if (os2.italic || head.italic) style = "italic";
  else {
    style =
      styleFromText(subfamily) ||
      styleFromText(fullName) ||
      styleFromText(fileName) ||
      "normal";
  }

  const wght = axes?.wght;
  const isVariable = Boolean(wght);
  const weightMin = isVariable ? snapWeight(wght.min) : weight;
  const weightMax = isVariable ? snapWeight(wght.max) : weight;

  return {
    familyGuess,
    subfamily: subfamily || (style === "italic" ? "Italic" : WEIGHT_OPTIONS.find((w) => w.value === weight)?.label.split(" ").slice(1).join(" ") || "Regular"),
    fullName,
    postscriptName,
    glyphCount,
    weight,
    style,
    isVariable,
    useRange: isVariable,
    weightMin,
    weightMax,
    tableCount: parsed.tables.length,
  };
}

export async function loadFontFile(file) {
  const buffer = await file.arrayBuffer();
  const { format, sfnt, flavor } = await unwrapToSfnt(buffer);
  const meta = parseFontMeta(sfnt, file.name);
  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    byteLength: file.size,
    sourceFormat: format,
    flavor,
    sfnt,
    ...meta,
  };
}

export function groupFacesIntoFamilies(faces) {
  const buckets = new Map();
  for (const face of faces) {
    const name = (face.familyGuess || "Untitled").trim() || "Untitled";
    const key = name.toLowerCase();
    if (!buckets.has(key)) buckets.set(key, { name, ids: [] });
    buckets.get(key).ids.push(face.id);
  }
  return [...buckets.values()].map((bucket) => ({
    id: crypto.randomUUID(),
    name: bucket.name,
    faceIds: bucket.ids,
  }));
}

export function assignFacesToFamilies(families, newFaces) {
  const next = families.map((family) => ({ ...family, faceIds: [...family.faceIds] }));
  const leftover = [];
  for (const face of newFaces) {
    const key = (face.familyGuess || "").trim().toLowerCase();
    const match = key && next.find((family) => family.name.trim().toLowerCase() === key);
    if (match) match.faceIds.push(face.id);
    else leftover.push(face);
  }
  return [...next, ...groupFacesIntoFamilies(leftover)];
}

export function slugify(value) {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "font";
}

export function outputBasename(familyName, face, used) {
  const fam = slugify(familyName);
  let base;
  if (face.useRange) {
    base = `${fam}-variable`;
    if (face.style !== "normal") base += `-${face.style}`;
  } else {
    base = `${fam}-${face.weight}`;
    if (face.style !== "normal") base += `-${face.style}`;
  }
  let name = base;
  let n = 2;
  while (used.has(name.toLowerCase())) {
    name = `${base}-${n}`;
    n += 1;
  }
  used.add(name.toLowerCase());
  return name;
}

export function normalizeUrlPrefix(prefix) {
  const value = (prefix || "").trim();
  if (!value) return "";
  return value.endsWith("/") ? value : `${value}/`;
}

export function quoteFontFamily(name) {
  return `"${String(name).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function cssFormatName(ext) {
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "otf") return "opentype";
  return "truetype";
}

export function sortFaceIds(ids, facesById) {
  return [...ids].sort((a, b) => {
    const fa = facesById.get(a);
    const fb = facesById.get(b);
    if (!fa || !fb) return 0;
    const wa = fa.useRange ? fa.weightMin : fa.weight;
    const wb = fb.useRange ? fb.weightMin : fb.weight;
    if (wa !== wb) return wa - wb;
    return String(fa.style).localeCompare(String(fb.style));
  });
}

export function buildKitFileMap(families, facesById) {
  const used = new Set();
  const faceFiles = new Map();
  for (const family of families) {
    for (const id of sortFaceIds(family.faceIds, facesById)) {
      const face = facesById.get(id);
      if (!face) continue;
      faceFiles.set(id, outputBasename(family.name, face, used));
    }
  }
  return faceFiles;
}

function srcList(base, prefix, formats, flavor) {
  const parts = [];
  for (const fmt of formats) {
    if (fmt === "woff2") {
      parts.push(`url("${prefix}${base}.woff2") format("woff2")`);
    } else if (fmt === "woff") {
      parts.push(`url("${prefix}${base}.woff") format("woff")`);
    } else if (fmt === "original") {
      const ext = flavor === "otf" ? "otf" : "ttf";
      parts.push(`url("${prefix}${base}.${ext}") format("${cssFormatName(ext)}")`);
    }
  }
  return parts;
}

export function buildKitCss({
  families,
  facesById,
  faceFiles,
  formats,
  display = "swap",
  urlPrefix = "fonts/",
}) {
  const prefix = normalizeUrlPrefix(urlPrefix);
  const blocks = [];
  for (const family of families) {
    for (const id of sortFaceIds(family.faceIds, facesById)) {
      const face = facesById.get(id);
      const base = faceFiles.get(id);
      if (!face || !base) continue;
      const src = srcList(base, prefix, formats, face.flavor);
      if (!src.length) continue;
      const weight = face.useRange
        ? `${face.weightMin} ${face.weightMax}`
        : String(face.weight);
      blocks.push(
        [
          "@font-face {",
          `  font-family: ${quoteFontFamily(family.name)};`,
          `  src: ${src.join(",\n       ")};`,
          `  font-weight: ${weight};`,
          `  font-style: ${face.style};`,
          `  font-display: ${display};`,
          "}",
        ].join("\n"),
      );
    }
  }
  return blocks.join("\n\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PREVIEW_SAMPLE =
  "The quick brown fox jumps over the lazy dog";
const PREVIEW_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PREVIEW_LOWER = "abcdefghijklmnopqrstuvwxyz 0123456789";

function previewFaceStyle(familyName, weight, style) {
  return escapeHtml(
    `font-family: ${quoteFontFamily(familyName)}; font-weight: ${weight}; font-style: ${style}; font-synthesis: none;`,
  );
}

export function buildKitPreviewHtml({ families, facesById }) {
  const sections = [];
  for (const family of families) {
    const ids = sortFaceIds(family.faceIds, facesById);
    const faces = ids.map((id) => facesById.get(id)).filter(Boolean);
    if (!faces.length) continue;
    const name = family.name.trim() || "Untitled";
    const rows = faces
      .map((face) => {
        const weight = face.useRange
          ? `${face.weightMin} ${face.weightMax}`
          : String(face.weight);
        const label = face.useRange
          ? `${face.weightMin}–${face.weightMax} ${face.style}`
          : `${face.weight} ${face.style}`;
        return [
          `      <div class="face">`,
          `        <p class="meta">${escapeHtml(face.fileName)} · ${escapeHtml(label)}</p>`,
          `        <p class="sample" style="${previewFaceStyle(name, weight, face.style)}">${escapeHtml(PREVIEW_SAMPLE)}</p>`,
          `        <p class="alpha" style="${previewFaceStyle(name, weight, face.style)}">${escapeHtml(PREVIEW_ALPHA)}</p>`,
          `        <p class="alpha" style="${previewFaceStyle(name, weight, face.style)}">${escapeHtml(PREVIEW_LOWER)}</p>`,
          `      </div>`,
        ].join("\n");
      })
      .join("\n");
    const ladder = WEIGHT_OPTIONS.map(
      (opt) =>
        `        <div class="ladder-row"><span>${opt.label}</span><p style="${previewFaceStyle(name, opt.value, "normal")}">${escapeHtml(PREVIEW_SAMPLE)}</p></div>`,
    ).join("\n");
    sections.push(
      [
        `    <section>`,
        `      <h2 style="${previewFaceStyle(name, faces[0].useRange ? `${faces[0].weightMin} ${faces[0].weightMax}` : String(faces[0].weight), faces[0].style)}">${escapeHtml(name)}</h2>`,
        rows,
        `      <h3>Weight ladder</h3>`,
        `      <div class="ladder">`,
        ladder,
        `      </div>`,
        `    </section>`,
      ].join("\n"),
    );
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Font kit preview</title>
  <link rel="stylesheet" href="fonts.css">
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0 auto;
      max-width: 52rem;
      padding: 2.5rem 1.25rem 4rem;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #fafaf9;
      color: #1c1917;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0c0a09; color: #fafaf9; }
    }
    h1 { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #78716c; }
    h2 { font-size: 2.25rem; font-weight: 400; margin: 0 0 1.25rem; line-height: 1.15; }
    h3 { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #78716c; margin: 1.75rem 0 0.75rem; }
    section { margin-top: 2.75rem; padding-top: 2rem; border-top: 1px solid #e7e5e4; }
    @media (prefers-color-scheme: dark) {
      section { border-top-color: #292524; }
    }
    .face { margin-bottom: 1.25rem; }
    .meta { font-family: ui-monospace, monospace; font-size: 0.7rem; color: #78716c; margin: 0 0 0.4rem; }
    .sample { font-size: 1.75rem; line-height: 1.3; margin: 0 0 0.35rem; }
    .alpha { font-size: 1.05rem; line-height: 1.4; margin: 0; }
    .ladder { border: 1px solid #e7e5e4; }
    @media (prefers-color-scheme: dark) {
      .ladder { border-color: #292524; }
    }
    .ladder-row { display: flex; gap: 1rem; align-items: baseline; padding: 0.7rem 0.9rem; border-bottom: 1px solid #e7e5e4; }
    .ladder-row:last-child { border-bottom: 0; }
    @media (prefers-color-scheme: dark) {
      .ladder-row { border-bottom-color: #292524; }
    }
    .ladder-row span { flex: 0 0 7.5rem; font-family: ui-monospace, monospace; font-size: 0.65rem; color: #78716c; }
    .ladder-row p { margin: 0; font-size: 1.2rem; line-height: 1.3; }
  </style>
</head>
<body>
  <h1>Font kit preview</h1>
${sections.join("\n")}
</body>
</html>
`;
}

export function duplicateFaceKeys(family, facesById) {
  const seen = new Map();
  const dups = new Set();
  for (const id of family.faceIds) {
    const face = facesById.get(id);
    if (!face) continue;
    const key = face.useRange
      ? `r:${face.weightMin}-${face.weightMax}:${face.style}`
      : `${face.weight}:${face.style}`;
    if (seen.has(key)) {
      dups.add(id);
      dups.add(seen.get(key));
    } else {
      seen.set(key, id);
    }
  }
  return dups;
}

export function isFontFile(file) {
  const name = file.name || "";
  if (/\.(ttf|otf|woff2?)$/i.test(name)) return true;
  const type = (file.type || "").toLowerCase();
  return (
    type.includes("font") ||
    type === "application/font-woff" ||
    type === "application/font-woff2" ||
    type === "application/x-font-ttf" ||
    type === "application/x-font-otf"
  );
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
