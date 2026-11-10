import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

export default function DiceRoller() {
  const [count, setCount] = useState(1);
  const [values, setValues] = useState([]);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    setValues([]);
    window.setTimeout(() => {
      const next = Array.from({ length: count }, () => rollDie());
      setValues(next);
      setRolling(false);
    }, 220);
  };

  const sum = values.length ? values.reduce((a, b) => a + b, 0) : null;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Dice" description="Roll one, two, or three fair d6. Total shown when more than one die." />

      <Panel className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center font-mono text-xs">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setCount(n);
                setValues([]);
              }}
              className={`px-4 py-2 border transition-colors ${
                count === n
                  ? "border-inverse-border bg-inverse text-primary-fg"
                  : "border-border-strong text-fg-muted hover:bg-hover-muted"
              }`}
            >
              {n} die{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <div
          className={`flex flex-wrap gap-3 justify-center min-h-[5rem] items-center ${
            rolling ? "opacity-60" : ""
          }`}
        >
          {values.length === 0 && !rolling && (
            <span className="font-mono text-sm text-fg-subtle">Press roll</span>
          )}
          {rolling && (
            <span className="font-mono text-sm text-fg-muted animate-pulse">
              Rolling…
            </span>
          )}
          {values.map((v, i) => (
            <div
              key={`${i}-${v}`}
              className="w-14 h-14 flex items-center justify-center border-2 border-border-muted dark:border-focus bg-hover-muted font-mono text-xl font-black text-fg rounded-sm"
            >
              {v}
            </div>
          ))}
        </div>

        {sum != null && count > 1 && !rolling && (
          <p className="text-center font-mono text-sm text-fg-muted">
            Total:{" "}
            <span className="text-fg font-bold tabular-nums">
              {sum}
            </span>
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={roll}
            disabled={rolling}
            className="px-8 py-3 font-mono text-sm bg-primary text-primary-fg rounded-button border border-border-strong hover:opacity-90 disabled:opacity-50"
          >
            Roll
          </button>
        </div>
      </Panel>
    </div>
  );
}
