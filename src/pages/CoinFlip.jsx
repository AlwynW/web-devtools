import { useState } from "react";

export default function CoinFlip() {
  const [side, setSide] = useState(null);
  const [flipping, setFlipping] = useState(false);

  const flip = () => {
    setFlipping(true);
    setSide(null);
    window.setTimeout(() => {
      setSide(Math.random() < 0.5 ? "heads" : "tails");
      setFlipping(false);
    }, 280);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Coin flip
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Fair 50/50. No history, no stakes, no point.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 text-center space-y-8">
        <div
          className={`mx-auto w-40 h-40 rounded-full border-4 flex items-center justify-center font-mono text-sm uppercase tracking-widest transition-transform duration-200 ${
            flipping ? "scale-95 opacity-70 border-stone-400 dark:border-stone-600" : ""
          } ${
            side === "heads"
              ? "border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100"
              : side === "tails"
                ? "border-stone-500 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-950 text-stone-400"
          }`}
        >
          {flipping ? (
            <span className="animate-pulse">…</span>
          ) : side ? (
            <span className="text-lg font-black">{side}</span>
          ) : (
            <span className="text-xs">?</span>
          )}
        </div>

        <button
          type="button"
          onClick={flip}
          disabled={flipping}
          className="px-8 py-3 font-mono text-sm bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-300 hover:opacity-90 disabled:opacity-50"
        >
          Flip
        </button>
      </div>
    </div>
  );
}
