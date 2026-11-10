import { useState, useMemo } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyButton from "../components/CopyButton";
import { TAILWIND_CLASSES } from "../data/tailwindClasses";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

export default function TailwindSearch({ onToast }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TAILWIND_CLASSES;
    return TAILWIND_CLASSES.filter(
      (c) =>
        c.class.toLowerCase().includes(q) ||
        c.property.toLowerCase().includes(q) ||
        c.value.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Tailwind Class Search" description="Quick reference for z-index, flex-basis, and other utilities." />

      <Panel className="space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="thin"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="> search classes (e.g. z-50, flex-basis, justify)"
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        <div className="max-h-[32rem] overflow-y-auto space-y-2">
          {results.map((c) => (
            <div
              key={c.class}
              className="flex items-center justify-between p-3 border border-border hover:bg-hover transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <code className="font-mono font-bold text-fg-soft">
                  {c.class}
                </code>
                <div className="text-sm text-fg-muted mt-0.5">
                  <span className="font-mono text-fg-muted">
                    {c.property}
                  </span>
                  {" → "}
                  <span className="font-mono text-xs">{c.value}</span>
                </div>
              </div>
              <CopyButton
                text={c.class}
                onCopySuccess={() => onToast("Class copied!")}
                size={16}
                className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-fg-muted font-mono text-sm">
            No matching classes found.
          </div>
        )}
      </Panel>
    </div>
  );
}
