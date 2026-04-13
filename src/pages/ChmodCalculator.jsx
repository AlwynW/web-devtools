import { useMemo, useState, useCallback } from "react";
import { copyToClipboard } from "../utils/clipboard";

const labels = [
  { key: "r", name: "Read" },
  { key: "w", name: "Write" },
  { key: "x", name: "Execute" },
];

function bitsFromTriple(o, g, a) {
  const v = (set) =>
    (set.r ? 4 : 0) + (set.w ? 2 : 0) + (set.x ? 1 : 0);
  return (v(o) << 6) | (v(g) << 3) | v(a);
}

function tripleFromOctal(octal) {
  const n = parseInt(String(octal).replace(/[^0-7]/g, ""), 8);
  if (Number.isNaN(n) || n < 0 || n > 511) return null;
  const o = !!(n & 0o400);
  const ow = !!(n & 0o200);
  const ox = !!(n & 0o100);
  const g = !!(n & 0o040);
  const gw = !!(n & 0o020);
  const gx = !!(n & 0o010);
  const a = !!(n & 0o004);
  const aw = !!(n & 0o002);
  const ax = !!(n & 0o001);
  return {
    owner: { r: o, w: ow, x: ox },
    group: { r: g, w: gw, x: gx },
    other: { r: a, w: aw, x: ax },
    octal: n,
  };
}

function ChmodRow({ title, state, section, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3 border-b border-stone-200 dark:border-stone-700 last:border-0">
      <div className="w-20 text-xs font-mono text-stone-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="flex gap-2">
        {labels.map(({ key, name }) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer font-mono text-sm text-stone-800 dark:text-stone-200"
          >
            <input
              type="checkbox"
              checked={state[key]}
              onChange={() => onToggle(section, key)}
              className="rounded border-stone-400"
            />
            <span title={name}>{key}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ChmodCalculator({ onToast }) {
  const [owner, setOwner] = useState({ r: true, w: true, x: true });
  const [group, setGroup] = useState({ r: true, w: false, x: true });
  const [other, setOther] = useState({ r: true, w: false, x: true });
  const [octInput, setOctInput] = useState("755");

  const bits = useMemo(
    () => bitsFromTriple(owner, group, other),
    [owner, group, other],
  );
  const octStr = useMemo(() => bits.toString(8).padStart(3, "0"), [bits]);

  const applyOctal = useCallback(() => {
    const t = tripleFromOctal(octInput);
    if (!t) return;
    setOwner(t.owner);
    setGroup(t.group);
    setOther(t.other);
  }, [octInput]);

  const toggle = (section, key) => {
    if (section === "owner")
      setOwner((s) => ({ ...s, [key]: !s[key] }));
    if (section === "group")
      setGroup((s) => ({ ...s, [key]: !s[key] }));
    if (section === "other")
      setOther((s) => ({ ...s, [key]: !s[key] }));
  };

  const symbolic = useMemo(() => {
    const sym = (s) => `${s.r ? "r" : "-"}${s.w ? "w" : "-"}${s.x ? "x" : "-"}`;
    return `${sym(owner)}${sym(group)}${sym(other)}`;
  }, [owner, group, other]);

  const copy = (text) =>
    copyToClipboard(text, () => onToast("Copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          chmod Calculator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Toggle rwx for owner, group, and other. Octal updates live.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <ChmodRow
          title="Owner"
          state={owner}
          section="owner"
          onToggle={toggle}
        />
        <ChmodRow
          title="Group"
          state={group}
          section="group"
          onToggle={toggle}
        />
        <ChmodRow
          title="Other"
          state={other}
          section="other"
          onToggle={toggle}
        />

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
              Octal (3 digits)
            </label>
            <p className="text-[11px] font-mono text-stone-500 mb-2">
              Live from toggles:{" "}
              <strong className="text-stone-800 dark:text-stone-200">{octStr}</strong>
            </p>
            <div className="flex gap-2">
              <input
                value={octInput}
                onChange={(e) => setOctInput(e.target.value)}
                className="flex-1 p-3 font-mono text-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                maxLength={3}
                placeholder="e.g. 644"
              />
              <button
                type="button"
                onClick={applyOctal}
                className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-950">
              <span className="text-stone-500">Octal</span>
              <button
                type="button"
                onClick={() => copy(octStr)}
                className="text-stone-900 dark:text-stone-100 font-semibold hover:underline"
              >
                {octStr}
              </button>
            </div>
            <div className="flex justify-between border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-950">
              <span className="text-stone-500">Symbolic</span>
              <button
                type="button"
                onClick={() => copy(symbolic)}
                className="text-stone-900 dark:text-stone-100 hover:underline"
              >
                {symbolic}
              </button>
            </div>
            <div className="flex justify-between border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-950">
              <span className="text-stone-500">chmod</span>
              <button
                type="button"
                onClick={() => copy(`chmod ${octStr} file`)}
                className="text-xs text-left text-stone-800 dark:text-stone-200 hover:underline break-all"
              >
                chmod {octStr} file
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
