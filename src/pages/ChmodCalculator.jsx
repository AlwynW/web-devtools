import { useMemo, useState, useCallback } from "react";
import CopyButton from "../components/CopyButton";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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
    <div className="flex flex-wrap items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="w-20 text-xs font-mono text-fg-muted uppercase tracking-wider">
        {title}
      </div>
      <div className="flex gap-2">
        {labels.map(({ key, name }) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer font-mono text-sm text-fg-soft"
          >
            <input
              type="checkbox"
              checked={state[key]}
              onChange={() => onToggle(section, key)}
              className="rounded border-border-muted"
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

  const copyToast = () => onToast("Copied!");

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="chmod Calculator" description="Toggle rwx for owner, group, and other. Octal updates live." />

      <Panel className="space-y-6">
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
            <label className="block text-[11px] font-mono text-fg-muted uppercase tracking-[0.18em] mb-2">
              Octal (3 digits)
            </label>
            <p className="text-[11px] font-mono text-fg-muted mb-2">
              Live from toggles:{" "}
              <strong className="text-fg-soft">{octStr}</strong>
            </p>
            <div className="flex gap-2">
              <input
                value={octInput}
                onChange={(e) => setOctInput(e.target.value)}
                className="flex-1 p-3 font-mono text-lg border border-border-strong bg-surface text-fg"
                maxLength={3}
                placeholder="e.g. 644"
              />
              <button
                type="button"
                onClick={applyOctal}
                className="px-4 py-2 font-mono text-xs border border-inverse-border bg-inverse text-primary-fg"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between items-center border border-border p-3 bg-surface-code">
              <span className="text-fg-muted">Octal</span>
              <div className="flex items-center gap-2">
                <span className="text-fg font-semibold font-mono">
                  {octStr}
                </span>
                <CopyButton text={octStr} onCopySuccess={copyToast} size={16} />
              </div>
            </div>
            <div className="flex justify-between items-center border border-border p-3 bg-surface-code">
              <span className="text-fg-muted">Symbolic</span>
              <div className="flex items-center gap-2">
                <span className="text-fg font-mono">
                  {symbolic}
                </span>
                <CopyButton text={symbolic} onCopySuccess={copyToast} size={16} />
              </div>
            </div>
            <div className="flex justify-between items-center border border-border p-3 bg-surface-code gap-2">
              <span className="text-fg-muted shrink-0">chmod</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-left text-fg-soft font-mono break-all">
                  chmod {octStr} file
                </span>
                <CopyButton
                  text={`chmod ${octStr} file`}
                  onCopySuccess={copyToast}
                  size={16}
                  className="shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
