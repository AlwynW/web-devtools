import { useMemo, useState } from "react";
import { diffLines } from "diff";
import CopyPre from "../components/CopyPre";

function prepare(text, ignoreTrim, ignoreCase) {
  let lines = text.replace(/\r\n/g, "\n").split("\n");
  if (ignoreTrim) lines = lines.map((l) => l.trimEnd());
  if (ignoreCase) lines = lines.map((l) => l.toLowerCase());
  return lines.join("\n");
}

function buildUnified(a, b, ignoreTrim, ignoreCase) {
  const left = prepare(a, ignoreTrim, ignoreCase);
  const right = prepare(b, ignoreTrim, ignoreCase);
  const parts = diffLines(left, right);
  let out = "";
  for (const part of parts) {
    const sym = part.added ? "+" : part.removed ? "-" : " ";
    const chunk = part.value.replace(/\n$/, "");
    const lines = chunk.length ? chunk.split("\n") : [];
    for (const line of lines) {
      out += `${sym} ${line}\n`;
    }
    if (part.value.endsWith("\n") && lines.length === 0) {
      out += `${sym} \n`;
    }
  }
  return out.trimEnd() + (out ? "\n" : "");
}

export default function TextDiff({ onToast }) {
  const [left, setLeft] = useState("line one\nline two\nshared");
  const [right, setRight] = useState("line one\nline TWO\nshared\nnew");
  const [ignoreTrim, setIgnoreTrim] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [mode, setMode] = useState("unified");

  const unified = useMemo(
    () => buildUnified(left, right, ignoreTrim, ignoreCase),
    [left, right, ignoreTrim, ignoreCase],
  );

  const sideBySide = useMemo(() => {
    const l = prepare(left, ignoreTrim, ignoreCase).split("\n");
    const r = prepare(right, ignoreTrim, ignoreCase).split("\n");
    const parts = diffLines(l.join("\n"), r.join("\n"));
    const outL = [];
    const outR = [];
    for (const part of parts) {
      const lines = part.value.replace(/\n$/, "").split("\n");
      const lastEmpty = part.value.endsWith("\n") && lines.length && lines[lines.length - 1] === "";
      const effective = lastEmpty ? lines.slice(0, -1) : lines;
      if (part.removed) {
        for (const line of effective) {
          outL.push({ text: line, kind: "removed" });
          outR.push({ text: "", kind: "empty" });
        }
      } else if (part.added) {
        for (const line of effective) {
          outL.push({ text: "", kind: "empty" });
          outR.push({ text: line, kind: "added" });
        }
      } else {
        for (const line of effective) {
          outL.push({ text: line, kind: "same" });
          outR.push({ text: line, kind: "same" });
        }
      }
    }
    const max = Math.max(outL.length, outR.length, 1);
    while (outL.length < max) outL.push({ text: "", kind: "empty" });
    while (outR.length < max) outR.push({ text: "", kind: "empty" });
    return { outL, outR };
  }, [left, right, ignoreTrim, ignoreCase]);

  const cell = (kind) => {
    if (kind === "removed")
      return "bg-red-100/80 dark:bg-red-950/40 text-stone-900 dark:text-stone-100";
    if (kind === "added")
      return "bg-green-100/80 dark:bg-green-950/40 text-stone-900 dark:text-stone-100";
    if (kind === "same")
      return "bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200";
    return "bg-stone-50 dark:bg-stone-950 text-stone-400";
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Text diff
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Line-based diff. Optional ignore trim and case for comparison only.
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center font-mono text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreTrim}
              onChange={(e) => setIgnoreTrim(e.target.checked)}
            />
            Ignore trailing trim per line
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
            Ignore case
          </label>
          <div className="flex gap-2 p-1 border border-stone-300 dark:border-stone-600">
            {[
              { id: "unified", label: "Unified" },
              { id: "split", label: "Side by side" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-2 py-1 ${mode === m.id ? "bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900" : "text-stone-600"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
              A
            </label>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={12}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
              B
            </label>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={12}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800">
          <span className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
            {mode === "unified" ? "Unified" : "Side by side"}
          </span>
          {mode === "unified" ? (
            <CopyPre
              text={unified || ""}
              onCopySuccess={() => onToast("Copied!")}
              title="Copy unified"
              className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 max-h-[28rem] overflow-y-auto overflow-x-auto"
              preClassName="p-3 font-mono text-xs whitespace-pre text-stone-800 dark:text-stone-200"
            >
              {unified || "—"}
            </CopyPre>
          ) : (
            <div className="grid grid-cols-2 gap-0 border border-stone-200 dark:border-stone-700 max-h-[28rem] overflow-y-auto font-mono text-xs">
              <div className="border-r border-stone-200 dark:border-stone-700">
                {sideBySide.outL.map((row, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 border-b border-stone-100 dark:border-stone-800 min-h-[1.25rem] ${cell(row.kind)}`}
                  >
                    {row.text || " "}
                  </div>
                ))}
              </div>
              <div>
                {sideBySide.outR.map((row, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 border-b border-stone-100 dark:border-stone-800 min-h-[1.25rem] ${cell(row.kind)}`}
                  >
                    {row.text || " "}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
