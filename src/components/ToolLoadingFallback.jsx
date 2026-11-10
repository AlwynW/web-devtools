import { CircleNotch } from "phosphor-react";

export default function ToolLoadingFallback({ label }) {
  return (
    <div
      className="py-20 flex flex-col items-center justify-center gap-5 animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-label={label ? `Loading ${label}` : "Loading tool"}
    >
      <CircleNotch
        size={32}
        weight="thin"
        className="animate-spin text-fg-subtle"
        aria-hidden
      />
      <div className="text-center space-y-1.5">
        <p className="text-sm font-mono text-fg-muted">Loading module…</p>
        {label && <p className="text-xs font-mono text-fg-subtle">{label}</p>}
      </div>
    </div>
  );
}
