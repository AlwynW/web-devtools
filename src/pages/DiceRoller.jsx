import { useState } from "react";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Dice
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Roll one, two, or three fair d6. Total shown when more than one die.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
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
                  ? "border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
                  : "border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
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
            <span className="font-mono text-sm text-stone-400">Press roll</span>
          )}
          {rolling && (
            <span className="font-mono text-sm text-stone-500 animate-pulse">
              Rolling…
            </span>
          )}
          {values.map((v, i) => (
            <div
              key={`${i}-${v}`}
              className="w-14 h-14 flex items-center justify-center border-2 border-stone-400 dark:border-stone-500 bg-stone-100 dark:bg-stone-800 font-mono text-xl font-black text-stone-900 dark:text-stone-100 rounded-sm"
            >
              {v}
            </div>
          ))}
        </div>

        {sum != null && count > 1 && !rolling && (
          <p className="text-center font-mono text-sm text-stone-600 dark:text-stone-400">
            Total:{" "}
            <span className="text-stone-900 dark:text-stone-100 font-bold tabular-nums">
              {sum}
            </span>
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={roll}
            disabled={rolling}
            className="px-8 py-3 font-mono text-sm bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-300 hover:opacity-90 disabled:opacity-50"
          >
            Roll
          </button>
        </div>
      </div>
    </div>
  );
}
