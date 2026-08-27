const WOFF_TAG = 0x774f4646;
const WOFF2_TAG = 0x774f4632;
const OTTO_TAG = 0x4f54544f;
const TRUE_TAG = 0x74727565;
const TYP1_TAG = 0x74797031;
const TTCF_TAG = 0x74746366;
const SFNT_TRUETYPE = 0x00010000;
const HEAD_MAGIC = 0xb1b0afba;

function asDataView(input) {
  if (input instanceof DataView) return input;
  if (input instanceof ArrayBuffer) return new DataView(input);
  if (ArrayBuffer.isView(input)) {
    return new DataView(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new Error("Invalid font buffer");
}

export function toArrayBuffer(data) {
  if (data instanceof ArrayBuffer) return data.slice(0);
  if (ArrayBuffer.isView(data)) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }
  throw new Error("Invalid font buffer");
}

function readTag(view, offset) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function writeTag(view, offset, tag) {
  for (let i = 0; i < 4; i += 1) {
    view.setUint8(offset + i, tag.charCodeAt(i) || 0x20);
  }
}

export function detectFontFormat(input) {
  const view = asDataView(input);
  if (view.byteLength < 4) return null;
  const tag = view.getUint32(0, false);
  if (tag === WOFF_TAG) return "woff";
  if (tag === WOFF2_TAG) return "woff2";
  if (tag === TTCF_TAG) return "ttc";
  if (tag === OTTO_TAG) return "otf";
  if (tag === SFNT_TRUETYPE || tag === TRUE_TAG || tag === TYP1_TAG) return "ttf";
  return null;
}

export function flavorExtension(flavor) {
  return flavor === "otf" ? "otf" : "ttf";
}

export function tableChecksum(bytes) {
  const pad = (4 - (bytes.byteLength % 4)) % 4;
  const buf = new Uint8Array(bytes.byteLength + pad);
  buf.set(bytes);
  const view = new DataView(buf.buffer);
  let sum = 0;
  for (let i = 0; i < buf.byteLength; i += 4) {
    sum = (sum + view.getUint32(i, false)) >>> 0;
  }
  return sum;
}

export function readSfnt(input) {
  const view = asDataView(input);
  if (view.byteLength < 12) throw new Error("Truncated font header");
  const flavorTag = view.getUint32(0, false);
  const numTables = view.getUint16(4, false);
  if (!numTables) throw new Error("Font has no tables");
  const tables = [];
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    if (rec + 16 > view.byteLength) throw new Error("Truncated table directory");
    const tag = readTag(view, rec);
    const checksum = view.getUint32(rec + 4, false);
    const offset = view.getUint32(rec + 8, false);
    const length = view.getUint32(rec + 12, false);
    if (offset + length > view.byteLength) {
      throw new Error(`Table ${tag.trim()} is truncated`);
    }
    const data = new Uint8Array(
      view.buffer,
      view.byteOffset + offset,
      length,
    ).slice();
    tables.push({ tag, checksum, data });
  }
  const flavor = flavorTag === OTTO_TAG ? "otf" : "ttf";
  return { flavor, flavorTag, tables };
}

export function getTable(sfnt, tag) {
  const parsed = sfnt.tables ? sfnt : readSfnt(sfnt);
  return parsed.tables.find((t) => t.tag === tag)?.data ?? null;
}

function sfntDirectoryMetrics(numTables) {
  let pow2 = 1;
  let entrySelector = 0;
  while (pow2 * 2 <= numTables) {
    pow2 *= 2;
    entrySelector += 1;
  }
  return {
    searchRange: pow2 * 16,
    entrySelector,
    rangeShift: numTables * 16 - pow2 * 16,
  };
}

export function writeSfnt(flavorTag, tables) {
  const sorted = [...tables].sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
  const prepared = sorted.map((table) => {
    let data = table.data;
    if (table.tag === "head" && data.byteLength >= 12) {
      data = data.slice();
      new DataView(data.buffer, data.byteOffset, data.byteLength).setUint32(8, 0, false);
    }
    return { tag: table.tag, data, checksum: tableChecksum(data) };
  });
  const numTables = prepared.length;
  const { searchRange, entrySelector, rangeShift } = sfntDirectoryMetrics(numTables);
  let offset = 12 + numTables * 16;
  const records = prepared.map((table) => {
    const rec = { ...table, offset, length: table.data.byteLength };
    offset += table.data.byteLength + ((4 - (table.data.byteLength % 4)) % 4);
    return rec;
  });
  const out = new Uint8Array(offset);
  const view = new DataView(out.buffer);
  view.setUint32(0, flavorTag, false);
  view.setUint16(4, numTables, false);
  view.setUint16(6, searchRange, false);
  view.setUint16(8, entrySelector, false);
  view.setUint16(10, rangeShift, false);
  let recOff = 12;
  for (const rec of records) {
    writeTag(view, recOff, rec.tag);
    view.setUint32(recOff + 4, rec.checksum, false);
    view.setUint32(recOff + 8, rec.offset, false);
    view.setUint32(recOff + 12, rec.length, false);
    recOff += 16;
    out.set(rec.data, rec.offset);
  }
  const head = records.find((t) => t.tag === "head");
  if (head && head.length >= 12) {
    let sum = 0;
    const aligned = out.byteLength - (out.byteLength % 4);
    for (let i = 0; i < aligned; i += 4) {
      sum = (sum + view.getUint32(i, false)) >>> 0;
    }
    if (out.byteLength % 4) {
      let tail = 0;
      for (let i = 0; i < out.byteLength % 4; i += 1) {
        tail |= out[aligned + i] << ((3 - i) * 8);
      }
      sum = (sum + tail) >>> 0;
    }
    view.setUint32(head.offset + 8, (HEAD_MAGIC - sum) >>> 0, false);
  }
  return out.buffer;
}

async function zlibCodec(data, stream) {
  if (!data.byteLength && stream instanceof CompressionStream) {
    return new Uint8Array(0);
  }
  const piped = new Blob([data]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

async function zlibDeflate(data) {
  if (typeof CompressionStream === "undefined") {
    throw new Error("This browser cannot compress WOFF (no CompressionStream)");
  }
  return zlibCodec(data, new CompressionStream("deflate"));
}

async function zlibInflate(data) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot decompress WOFF (no DecompressionStream)");
  }
  try {
    return await zlibCodec(data, new DecompressionStream("deflate"));
  } catch {
    return zlibCodec(data, new DecompressionStream("deflate-raw"));
  }
}

export async function woffToSfnt(input) {
  const view = asDataView(input);
  if (view.byteLength < 44 || view.getUint32(0, false) !== WOFF_TAG) {
    throw new Error("Not a WOFF font");
  }
  const flavorTag = view.getUint32(4, false);
  const numTables = view.getUint16(12, false);
  const tables = [];
  for (let i = 0; i < numTables; i += 1) {
    const rec = 44 + i * 20;
    const tag = readTag(view, rec);
    const offset = view.getUint32(rec + 4, false);
    const compLength = view.getUint32(rec + 8, false);
    const origLength = view.getUint32(rec + 12, false);
    if (offset + compLength > view.byteLength) {
      throw new Error(`WOFF table ${tag.trim()} is truncated`);
    }
    const chunk = new Uint8Array(
      view.buffer,
      view.byteOffset + offset,
      compLength,
    );
    let data;
    if (compLength === origLength) {
      data = chunk.slice();
    } else {
      data = await zlibInflate(chunk);
      if (data.byteLength !== origLength) {
        throw new Error(`WOFF table ${tag.trim()} decompressed to the wrong size`);
      }
    }
    tables.push({ tag, data });
  }
  return writeSfnt(flavorTag, tables);
}

export async function sfntToWoff(input) {
  const parsed = readSfnt(input);
  const entries = [];
  for (const table of parsed.tables) {
    const compressed = await zlibDeflate(table.data);
    const useCompressed = compressed.byteLength > 0 && compressed.byteLength < table.data.byteLength;
    const payload = useCompressed ? compressed : table.data;
    entries.push({
      tag: table.tag,
      origChecksum: table.checksum,
      origLength: table.data.byteLength,
      payload,
    });
  }
  const numTables = entries.length;
  let offset = 44 + numTables * 20;
  const laidOut = entries.map((entry) => {
    const rec = { ...entry, offset };
    offset += entry.payload.byteLength + ((4 - (entry.payload.byteLength % 4)) % 4);
    return rec;
  });
  const out = new Uint8Array(offset);
  const view = new DataView(out.buffer);
  view.setUint32(0, WOFF_TAG, false);
  view.setUint32(4, parsed.flavorTag, false);
  view.setUint32(8, offset, false);
  view.setUint16(12, numTables, false);
  view.setUint16(14, 0, false);
  view.setUint32(16, asDataView(input).byteLength, false);
  view.setUint16(20, 1, false);
  view.setUint16(22, 0, false);
  let rec = 44;
  for (const entry of laidOut) {
    writeTag(view, rec, entry.tag);
    view.setUint32(rec + 4, entry.offset, false);
    view.setUint32(rec + 8, entry.payload.byteLength, false);
    view.setUint32(rec + 12, entry.origLength, false);
    view.setUint32(rec + 16, entry.origChecksum >>> 0, false);
    rec += 20;
    out.set(entry.payload, entry.offset);
  }
  return out.buffer;
}

async function woff2Module() {
  return import("woff2-encoder");
}

export async function woff2ToSfnt(input) {
  const { decompress } = await woff2Module();
  return toArrayBuffer(await decompress(input));
}

export async function sfntToWoff2(input) {
  const { compress } = await woff2Module();
  return toArrayBuffer(await compress(new Uint8Array(toArrayBuffer(input))));
}

export async function unwrapToSfnt(input) {
  const buffer = toArrayBuffer(input);
  const format = detectFontFormat(buffer);
  if (!format) throw new Error("Not a TTF, OTF, WOFF, or WOFF2 font");
  if (format === "ttc") {
    throw new Error("TrueType collections (.ttc) are not supported. Export single fonts first.");
  }
  if (format === "woff2") {
    const sfnt = await woff2ToSfnt(buffer);
    const inner = detectFontFormat(sfnt);
    return { format, sfnt, flavor: inner === "otf" ? "otf" : "ttf" };
  }
  if (format === "woff") {
    const sfnt = await woffToSfnt(buffer);
    const inner = detectFontFormat(sfnt);
    return { format, sfnt, flavor: inner === "otf" ? "otf" : "ttf" };
  }
  return { format, sfnt: buffer, flavor: format };
}

export async function convertSfnt(sfnt, target) {
  if (target === "woff2") return sfntToWoff2(sfnt);
  if (target === "woff") return sfntToWoff(sfnt);
  if (target === "ttf" || target === "otf") return toArrayBuffer(sfnt);
  throw new Error(`Cannot convert to ${target}`);
}
