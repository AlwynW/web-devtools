import { useState, useMemo, useEffect, useRef } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import { copyToClipboard } from "../utils/clipboard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

const MORSE_MAP = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-",
  '"': ".-..-.", $: "...-..-", "@": ".--.-.", " ": "/",
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k === "/" ? " " : k])
);

const REFERENCE_LIST = Object.entries(MORSE_MAP)
  .filter(([k]) => k !== " ")
  .map(([char, morse]) => ({ char, morse }))
  .sort((a, b) => (a.char < b.char ? -1 : 1));

function textToMorse(text) {
  return text
    .toUpperCase()
    .split("")
    .map((c) => MORSE_MAP[c] || (c === " " ? "/" : `?${c}?`))
    .join(" ");
}

function morseToText(morse) {
  return morse
    .split(/\s+/)
    .map((s) => REVERSE_MAP[s] ?? "?")
    .join("");
}

const SHORT_THRESHOLD_MS = 200;
const PAUSE_THRESHOLD_MS = 400;

export default function MorseCode({ onToast }) {
  const [mode, setMode] = useState("toMorse");
  const [input, setInput] = useState("");
  const [refSearch, setRefSearch] = useState("");
  const [spacebarMode, setSpacebarMode] = useState(false);
  const pressStartRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  useEffect(() => {
    if (!spacebarMode || mode !== "toText") return;

    const handleKeyDown = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      pressStartRef.current = Date.now();
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      if (pressStartRef.current === null) return;
      const duration = Date.now() - pressStartRef.current;
      const symbol = duration < SHORT_THRESHOLD_MS ? "." : "-";
      setInput((prev) => prev + symbol);
      pressStartRef.current = null;

      pauseTimeoutRef.current = setTimeout(() => {
        setInput((prev) => (prev.endsWith(" ") ? prev : prev + " "));
        pauseTimeoutRef.current = null;
      }, PAUSE_THRESHOLD_MS);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [spacebarMode, mode]);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return mode === "toMorse" ? textToMorse(input) : morseToText(input);
  }, [input, mode]);

  const filteredRef = useMemo(() => {
    const q = refSearch.trim().toLowerCase();
    if (!q) return REFERENCE_LIST;
    return REFERENCE_LIST.filter(
      (r) =>
        r.char.toLowerCase().includes(q) ||
        r.morse.toLowerCase().includes(q)
    );
  }, [refSearch]);

  const copyChar = (char) => {
    copyToClipboard(char, () => onToast("Copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Morse Code" description="Encode and decode Morse code with reference table." />

      <div className="space-y-8">
        <Panel className="space-y-4">
          <h3 className="field-label">
            Converter
          </h3>
          <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control w-max font-mono text-[11px]">
            <button
              onClick={() => setMode("toMorse")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "toMorse"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              Text → Morse
            </button>
            <button
              onClick={() => setMode("toText")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "toText"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              Morse → Text
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>
                Input
              </Label>
              {input && (
                <button
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
              placeholder={mode === "toMorse" ? "Hello world" : ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."}
              className="w-full h-24 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
            {mode === "toText" && (
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInput((prev) => prev + ".")}
                    className="flex-1 py-3 border border-border-strong bg-surface hover:bg-hover font-mono text-sm text-fg-soft transition-colors"
                  >
                    Short (·)
                  </button>
                  <button
                    onClick={() => setInput((prev) => prev + "-")}
                    className="flex-1 py-3 border border-border-strong bg-surface hover:bg-hover font-mono text-sm text-fg-soft transition-colors"
                  >
                    Long (−)
                  </button>
                  <button
                    onClick={() => setInput((prev) => prev + " ")}
                    className="flex-1 py-3 border border-border-strong bg-surface hover:bg-hover font-mono text-sm text-fg-soft transition-colors"
                  >
                    Pause
                  </button>
                </div>
                <button
                  onClick={() => setSpacebarMode((prev) => !prev)}
                  className={`w-full py-2 font-mono text-sm border transition-colors ${
                    spacebarMode
                      ? "bg-warning-bg border-amber-400 dark:border-amber-600 text-warning-fg"
                      : "border-border-strong bg-surface hover:bg-hover text-fg-soft"
                  }`}
                >
                  {spacebarMode ? "End spacebar mode" : "Start spacebar mode"}
                </button>
                {spacebarMode && (
                  <p className="text-xs font-mono text-fg-muted">
                    Short press = dot · &nbsp; Long press = dash − &nbsp; Pause after release = space
                  </p>
                )}
              </div>
            )}
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
              placeholder="> search by character or Morse"
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
            {filteredRef.map(({ char, morse }) => (
              <button
                key={char}
                onClick={() => copyChar(mode === "toMorse" ? morse : char)}
                className="p-2 border border-border hover:bg-hover text-left font-mono text-sm"
              >
                <span className="font-bold text-fg-soft">{char}</span>
                <div className="text-xs text-fg-muted truncate">{morse}</div>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
