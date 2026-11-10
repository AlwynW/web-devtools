import { useMemo, useState } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import { copyToClipboard } from "../utils/clipboard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

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
      <PageHeader title="Braille" description="Grade 1 English Braille (Unicode); digits use number sign + letter cells." />

      <div className="space-y-8">
        <Panel className="space-y-4">
          <h3 className="field-label">
            Converter
          </h3>
          <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control w-max font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setMode("encode")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "encode"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              Text → Braille
            </button>
            <button
              type="button"
              onClick={() => setMode("decode")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "decode"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              Braille → Text
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>
                Input
              </Label>
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="text-xs font-mono text-fg-muted hover:text-fg"
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
              className="w-full min-h-[7rem] p-4 bg-surface border border-border-strong font-mono text-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              spellCheck={mode === "encode"}
            />
            <p className="mt-2 text-xs font-mono text-fg-muted">
              Decode expects Unicode Braille patterns; unsupported cells pass through.
              Contractions beyond Grade 1 are not implemented.
            </p>
          </div>
          {output && (
            <>
              <Label className="mb-1">
                Output
              </Label>
              <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
            </>
          )}
        </Panel>

        <Panel className="space-y-4">
          <h3 className="field-label">
            Reference
          </h3>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="thin"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
            <input
              type="text"
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              placeholder="> search letter / digit"
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
            {filteredRef.map(({ key, label, symbol }) => (
              <button
                key={key}
                type="button"
                onClick={() => copySym(symbol)}
                className="p-2 border border-border hover:bg-hover text-center font-mono text-lg leading-snug"
              >
                <span className="block text-xs font-bold text-fg-soft mb-1">
                  {label}
                </span>
                <span className="text-fg">{symbol}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
