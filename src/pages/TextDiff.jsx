import { useMemo, useState } from "react";
import { diffLines } from "diff";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import SegmentedControl from "../components/ui/SegmentedControl";

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
      return "bg-red-100/80 dark:bg-red-950/40 text-fg";
    if (kind === "added")
      return "bg-green-100/80 dark:bg-green-950/40 text-fg";
    if (kind === "same")
      return "bg-surface text-fg-soft";
    return "bg-surface-code text-fg-subtle";
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Text diff" description="Line-based diff. Optional ignore trim and case for comparison only." />

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
          <SegmentedControl
            options={[
              { value: "unified", label: "Unified" },
              { value: "split", label: "Side by side" },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="field-label mb-1">
              A
            </label>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={12}
              className="w-full p-3 border border-border-strong rounded-control font-mono text-xs bg-surface text-fg"
            />
          </div>
          <div>
            <label className="field-label mb-1">
              B
            </label>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={12}
              className="w-full p-3 border border-border-strong rounded-control font-mono text-xs bg-surface text-fg"
            />
          </div>
        </div>

        <div className="bg-surface p-4 border border-border rounded-panel">
          <span className="field-label mb-2">
            {mode === "unified" ? "Unified" : "Side by side"}
          </span>
          {mode === "unified" ? (
            <CopyPre
              text={unified || ""}
              onCopySuccess={() => onToast("Copied!")}
              title="Copy unified"
              className="border border-border rounded-control bg-surface-code max-h-[28rem] overflow-y-auto overflow-x-auto"
              preClassName="p-3 font-mono text-xs whitespace-pre text-fg-soft"
            >
              {unified || "—"}
            </CopyPre>
          ) : (
            <div className="grid grid-cols-2 gap-0 border border-border rounded-control max-h-[28rem] overflow-y-auto font-mono text-xs">
              <div className="border-r border-border">
                {sideBySide.outL.map((row, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 border-b border-border min-h-[1.25rem] ${cell(row.kind)}`}
                  >
                    {row.text || " "}
                  </div>
                ))}
              </div>
              <div>
                {sideBySide.outR.map((row, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 border-b border-border min-h-[1.25rem] ${cell(row.kind)}`}
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
