import { useState, useRef } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

export default function ClickCounter() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: "50%", y: "50%" });
  const containerRef = useRef(null);

  const handleClick = () => {
    setCount((c) => c + 1);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 80;
    const maxX = rect.width - padding;
    const maxY = rect.height - padding;
    const newX = Math.random() * maxX + padding / 2;
    const newY = Math.random() * maxY + padding / 2;
    setPosition({ x: newX, y: newY });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Click Counter" description="Count clicks. The button moves. No purpose." />

      <Panel>
        <p className="font-mono text-center text-fg-muted mb-6">
          You have clicked {count} time{count !== 1 ? "s" : ""}.
        </p>
        <div
          ref={containerRef}
          className="relative h-64 rounded border border-border bg-surface-muted/50"
        >
          <button
            type="button"
            onClick={handleClick}
            className="absolute px-6 py-3 font-mono text-sm bg-primary text-primary-fg rounded-button border border-border-strong hover:bg-primary-hover transition-colors"
            style={{
              left: position.x,
              top: position.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            Click me
          </button>
        </div>
      </Panel>
    </div>
  );
}
