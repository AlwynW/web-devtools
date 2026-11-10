import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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
      <PageHeader title="Coin flip" description="Fair 50/50. No history, no stakes, no point." />

      <Panel className="text-center space-y-8">
        <div
          className={`mx-auto w-40 h-40 rounded-full border-4 flex items-center justify-center font-mono text-sm uppercase tracking-widest transition-transform duration-200 ${
            flipping ? "scale-95 opacity-70 border-border-muted" : ""
          } ${
            side === "heads"
              ? "border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100"
              : side === "tails"
                ? "border-focus bg-hover-muted text-fg-soft"
                : "border-border-strong bg-surface-code text-fg-subtle"
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
          className="px-8 py-3 font-mono text-sm bg-primary text-primary-fg rounded-button border border-border-strong hover:opacity-90 disabled:opacity-50"
        >
          Flip
        </button>
      </Panel>
    </div>
  );
}
