import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Button from "../components/Button";
import SegmentedControl from "../components/ui/SegmentedControl";

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
        <SegmentedControl
          options={[1, 2, 3].map((n) => ({ value: n, label: `${n} die${n > 1 ? "s" : ""}` }))}
          value={count}
          onChange={(n) => {
            setCount(n);
            setValues([]);
          }}
          className="mx-auto"
        />

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
          <Button onClick={roll} disabled={rolling}>
            Roll
          </Button>
        </div>
      </Panel>
    </div>
  );
}
