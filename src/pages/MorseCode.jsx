import { useState, useMemo, useEffect, useRef } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import { copyToClipboard } from "../utils/clipboard";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Morse Code
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Encode and decode Morse code with reference table.
        </p>
      </header>

      <div className="space-y-8">
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Converter
          </h3>
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
            <button
              onClick={() => setMode("toMorse")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "toMorse"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Text → Morse
            </button>
            <button
              onClick={() => setMode("toText")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "toText"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              Morse → Text
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                Input
              </label>
              {input && (
                <button
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
              placeholder={mode === "toMorse" ? "Hello world" : ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."}
              className="w-full h-24 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
            {mode === "toText" && (
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInput((prev) => prev + ".")}
                    className="flex-1 py-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 font-mono text-sm text-stone-700 dark:text-stone-200 transition-colors"
                  >
                    Short (·)
                  </button>
                  <button
                    onClick={() => setInput((prev) => prev + "-")}
                    className="flex-1 py-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 font-mono text-sm text-stone-700 dark:text-stone-200 transition-colors"
                  >
                    Long (−)
                  </button>
                  <button
                    onClick={() => setInput((prev) => prev + " ")}
                    className="flex-1 py-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 font-mono text-sm text-stone-700 dark:text-stone-200 transition-colors"
                  >
                    Pause
                  </button>
                </div>
                <button
                  onClick={() => setSpacebarMode((prev) => !prev)}
                  className={`w-full py-2 font-mono text-sm border transition-colors ${
                    spacebarMode
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                      : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                  }`}
                >
                  {spacebarMode ? "End spacebar mode" : "Start spacebar mode"}
                </button>
                {spacebarMode && (
                  <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                    Short press = dot · &nbsp; Long press = dash − &nbsp; Pause after release = space
                  </p>
                )}
              </div>
            )}
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
              placeholder="> search by character or Morse"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
            {filteredRef.map(({ char, morse }) => (
              <button
                key={char}
                onClick={() => copyChar(mode === "toMorse" ? morse : char)}
                className="p-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 text-left font-mono text-sm"
              >
                <span className="font-bold text-stone-800 dark:text-stone-200">{char}</span>
                <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{morse}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
