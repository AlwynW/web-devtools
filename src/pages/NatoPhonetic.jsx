import { useMemo, useState } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import { copyToClipboard } from "../utils/clipboard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

const LETTER_WORD = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
};

const DIGIT_WORD = {
  0: "Zero",
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
};

const REFERENCE_ROWS = [
  ...Object.entries(LETTER_WORD).map(([char, word]) => ({
    key: char,
    label: char,
    word,
  })),
  ...Object.entries(DIGIT_WORD).map(([char, word]) => ({
    key: `d${char}`,
    label: char,
    word,
  })),
];

function spellNato(text) {
  const tokens = [];
  let pendingGap = false;

  for (const raw of text) {
    const c = raw.toUpperCase();

    if (c >= "A" && c <= "Z") {
      if (pendingGap && tokens.length > 0) tokens.push(" ");
      pendingGap = false;
      tokens.push(LETTER_WORD[c]);
      continue;
    }

    if (c >= "0" && c <= "9") {
      if (pendingGap && tokens.length > 0) tokens.push(" ");
      pendingGap = false;
      tokens.push(DIGIT_WORD[c]);
      continue;
    }

    if (raw === " " || raw === "\n" || raw === "\t") {
      pendingGap = true;
      continue;
    }

    if (pendingGap && tokens.length > 0) tokens.push(" ");
    pendingGap = false;
    tokens.push(`[${raw}]`);
  }

  return tokens.join("");
}

export default function NatoPhonetic({ onToast }) {
  const [input, setInput] = useState("");
  const [refSearch, setRefSearch] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    return spellNato(input);
  }, [input]);

  const filteredRef = useMemo(() => {
    const q = refSearch.trim().toLowerCase();
    if (!q) return REFERENCE_ROWS;
    return REFERENCE_ROWS.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.word.toLowerCase().includes(q)
    );
  }, [refSearch]);

  const copyWord = (word) => {
    copyToClipboard(word, () => onToast("Copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="NATO Phonetic" description="ICAO spelling alphabet for letters A–Z and digits 0–9." />

      <div className="space-y-8">
        <Panel className="space-y-4">
          <h3 className="field-label">
            Spell-out
          </h3>
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
              placeholder="HELLO 911"
              className="w-full h-24 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
            <p className="mt-2 text-xs font-mono text-fg-muted">
              Whitespace separates word groups. Other characters appear as{" "}
              <span className="text-fg-soft">[char]</span>.
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
              placeholder="> search letter or word"
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {filteredRef.map(({ key, label, word }) => (
              <button
                key={key}
                type="button"
                onClick={() => copyWord(word)}
                className="p-2 border border-border rounded-control hover:bg-hover text-left font-mono text-sm"
              >
                <span className="font-bold text-fg-soft">
                  {label}
                </span>
                <div className="text-xs text-fg-muted truncate">
                  {word}
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
