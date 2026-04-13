import { useMemo, useState } from "react";

const ZW = new Set([
  "\u200B",
  "\u200C",
  "\u200D",
  "\uFEFF",
  "\u2060",
  "\u00AD",
]);

function utf8Bytes(codePoint) {
  const cp = codePoint;
  if (cp < 0x80) return [cp];
  if (cp < 0x800)
    return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)];
  if (cp < 0x10000) {
    return [
      0xe0 | (cp >> 12),
      0x80 | ((cp >> 6) & 0x3f),
      0x80 | (cp & 0x3f),
    ];
  }
  return [
    0xf0 | (cp >> 18),
    0x80 | ((cp >> 12) & 0x3f),
    0x80 | ((cp >> 6) & 0x3f),
    0x80 | (cp & 0x3f),
  ];
}

function* scalarStrings(s) {
  for (let i = 0; i < s.length; ) {
    const c = s.codePointAt(i);
    yield String.fromCodePoint(c);
    i += c > 0xffff ? 2 : 1;
  }
}

function charFlags(ch) {
  const flags = [];
  if (ZW.has(ch)) flags.push("zero-width / format");
  try {
    if (/\p{gc=Format}/u.test(ch)) flags.push("format");
    if (/\p{gc=Control}/u.test(ch)) flags.push("control");
  } catch {
    /* older engines */
  }
  return flags;
}

export default function UnicodeInspector() {
  const [text, setText] = useState("café \\u200B test\r\n𝄞");

  const rows = useMemo(() => {
    const seg =
      typeof Intl !== "undefined" && Intl.Segmenter
        ? [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)]
            .map((s) => s.segment)
        : [...text];

    const out = [];
    let offset = 0;
    for (const g of seg) {
      const len = g.length;
      const codePoints = [];
      for (let i = 0; i < g.length; ) {
        const c = g.codePointAt(i);
        const w = c > 0xffff ? 2 : 1;
        codePoints.push({ c, hex: c.toString(16).toUpperCase().padStart(4, "0") });
        i += w;
      }
      const nfc = g.normalize("NFC");
      const nfd = g.normalize("NFD");
      const nfkc = g.normalize("NFKC");
      const nfkd = g.normalize("NFKD");
      const same = nfc === nfd && nfc === nfkc && nfc === nfkd;
      const flags = [
        ...new Set(
          [...scalarStrings(g)].flatMap((ch) => charFlags(ch)),
        ),
      ];
      out.push({
        grapheme: g,
        offset,
        len,
        codePoints,
        nfc,
        nfd,
        nfkc,
        nfkd,
        same,
        flags,
      });
      offset += len;
    }
    return out;
  }, [text]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Unicode inspector
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Graphemes, code points, UTF-8 bytes, normalization (NFC/NFD/NFKC/NFKD).
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />

        <div className="space-y-3 max-h-[32rem] overflow-y-auto">
          {rows.map((r, idx) => (
            <div
              key={`${idx}-${r.offset}`}
              className="p-3 border border-stone-200 dark:border-stone-700 text-xs font-mono space-y-1 bg-stone-50 dark:bg-stone-950"
            >
              <div className="flex flex-wrap gap-2 text-stone-600 dark:text-stone-400">
                <span>offset {r.offset}</span>
                {!r.same && (
                  <span className="text-amber-700 dark:text-amber-400">
                    normalization differs
                  </span>
                )}
                {r.flags.map((f) => (
                  <span
                    key={f}
                    className="text-red-600 dark:text-red-400"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="text-stone-800 dark:text-stone-200">
                {r.codePoints.map(({ c, hex }) => {
                  const bytes = utf8Bytes(c)
                    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
                    .join(" ");
                  return (
                    <div key={hex} className="py-0.5">
                      U+{hex} · UTF-8 {bytes}
                    </div>
                  );
                })}
              </div>
              {!r.same && (
                <div className="text-[11px] text-stone-500 space-y-0.5 pt-1 border-t border-stone-200 dark:border-stone-700">
                  {(["nfc", "nfd", "nfkc", "nfkd"] ).map((k) => {
                    const s = r[k];
                    const pts = [...scalarStrings(s)]
                      .map(
                        (ch) =>
                          `U+${ch.codePointAt(0).toString(16).toUpperCase()}`,
                      )
                      .join(" ");
                    return (
                      <div key={k}>
                        {k.toUpperCase()}: {pts}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
