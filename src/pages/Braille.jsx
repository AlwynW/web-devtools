import { useMemo, useState } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import { copyToClipboard } from "../utils/clipboard";

const BRAILLE_START = 0x2800;
const NUMBER_SIGN = "\u283c";

function cell(...dots) {
  let bits = 0;
  for (const d of dots) bits |= 1 << (d - 1);
  return String.fromCharCode(BRAILLE_START + bits);
}

const LETTERS = {
  a: cell(1),
  b: cell(1, 2),
  c: cell(1, 4),
  d: cell(1, 4, 5),
  e: cell(1, 5),
  f: cell(1, 2, 4),
  g: cell(1, 2, 4, 5),
  h: cell(1, 2, 5),
  i: cell(2, 4),
  j: cell(2, 4, 5),
  k: cell(1, 3),
  l: cell(1, 2, 3),
  m: cell(1, 3, 4),
  n: cell(1, 3, 4, 5),
  o: cell(1, 3, 5),
  p: cell(1, 2, 3, 4),
  q: cell(1, 2, 3, 4, 5),
  r: cell(1, 2, 3, 5),
  s: cell(2, 3, 4),
  t: cell(2, 3, 4, 5),
  u: cell(1, 3, 6),
  v: cell(1, 2, 3, 6),
  w: cell(2, 4, 5, 6),
  x: cell(1, 3, 4, 6),
  y: cell(1, 3, 4, 5, 6),
  z: cell(1, 3, 5, 6),
};

const DIGIT_ORDER = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const DIGIT_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

const LETTER_CELL_TO_CHAR = Object.fromEntries(
  Object.entries(LETTERS).map(([ch, sym]) => [sym, ch])
);

const CELL_TO_DIGIT = Object.fromEntries(
  DIGIT_KEYS.map((k, idx) => [LETTERS[k], DIGIT_ORDER[idx]])
);

const SPACE_CELL = "\u2800";

const PUNCT_ENCODE = {
  ",": cell(2),
  ";": cell(2, 3),
  ":": cell(2, 5),
  ".": cell(2, 5, 6),
  "!": cell(2, 3, 5),
  "?": cell(2, 3, 6),
  "-": cell(3, 6),
  "'": cell(3),
};

const PUNCT_DECODE = Object.fromEntries(
  Object.entries(PUNCT_ENCODE).map(([ascii, sym]) => [sym, ascii])
);

const REFERENCE_LIST = [
  ...Object.entries(LETTERS).map(([ch, sym]) => ({
    key: ch,
    label: ch,
    symbol: sym,
  })),
  ...DIGIT_ORDER.map((d, idx) => ({
    key: `n${d}`,
    label: d,
    symbol: `${NUMBER_SIGN}${LETTERS[DIGIT_KEYS[idx]]}`,
  })),
];

function encodeBraille(text) {
  let out = "";
  for (const raw of text) {
    const c = raw.toLowerCase();
    if (c >= "a" && c <= "z") {
      out += LETTERS[c];
      continue;
    }
    if (c >= "0" && c <= "9") {
      const idx = c === "0" ? 9 : Number(c) - 1;
      out += NUMBER_SIGN + LETTERS[DIGIT_KEYS[idx]];
      continue;
    }
    if (raw === " " || raw === "\n" || raw === "\t") {
      out += SPACE_CELL;
      continue;
    }
    if (PUNCT_ENCODE[raw] !== undefined) {
      out += PUNCT_ENCODE[raw];
      continue;
    }
    out += raw;
  }
  return out;
}

function decodeBraille(braille) {
  let out = "";
  const chars = [...braille];
  for (let i = 0; i < chars.length; ) {
    const sym = chars[i];

    if (sym === " ") {
      out += " ";
      i += 1;
      continue;
    }
    if (sym === SPACE_CELL) {
      out += " ";
      i += 1;
      continue;
    }
    if (sym === NUMBER_SIGN) {
      i += 1;
      if (i >= chars.length) {
        out += "?";
        break;
      }
      const next = chars[i];
      const digit = CELL_TO_DIGIT[next];
      if (digit !== undefined) {
        out += digit;
        i += 1;
        continue;
      }
      out += "?";
      continue;
    }

    const punct = PUNCT_DECODE[sym];
    if (punct !== undefined) {
      out += punct;
      i += 1;
      continue;
    }

    const letter = LETTER_CELL_TO_CHAR[sym];
    if (letter !== undefined) {
      out += letter;
      i += 1;
      continue;
    }

    out += sym;
    i += 1;
  }
  return out;
}

export default function Braille({ onToast }) {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [refSearch, setRefSearch] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? encodeBraille(input) : decodeBraille(input);
  }, [input, mode]);

  const filteredRef = useMemo(() => {
    const q = refSearch.trim().toLowerCase();
    if (!q) return REFERENCE_LIST;
    return REFERENCE_LIST.filter((r) => r.label.toLowerCase().includes(q));
  }, [refSearch]);

  const copySym = (symbol) => {
    copyToClipboard(symbol, () => onToast("Copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Braille
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Grade 1 English Braille (Unicode); digits use number sign + letter cells.
        </p>
      </header>

      <div className="space-y-8">
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Converter
          </h3>
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setMode("encode")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "encode"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Text → Braille
            </button>
            <button
              type="button"
              onClick={() => setMode("decode")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "decode"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Braille → Text
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                Input
              </label>
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "hello 42"
                  : "\u2813\u2811\u2807\u2807\u2815"
              }
              className="w-full min-h-[7rem] p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              spellCheck={mode === "encode"}
            />
            <p className="mt-2 text-xs font-mono text-stone-500 dark:text-stone-400">
              Decode expects Unicode Braille patterns; unsupported cells pass through.
              Contractions beyond Grade 1 are not implemented.
            </p>
          </div>
          {output && (
            <>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                Output
              </label>
              <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
            </>
          )}
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Reference
          </h3>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="thin"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              placeholder="> search letter / digit"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
            {filteredRef.map(({ key, label, symbol }) => (
              <button
                key={key}
                type="button"
                onClick={() => copySym(symbol)}
                className="p-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 text-center font-mono text-lg leading-snug"
              >
                <span className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {label}
                </span>
                <span className="text-stone-900 dark:text-stone-100">{symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
