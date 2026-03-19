import { useState, useRef } from "react";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Click Counter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Count clicks. The button moves. No purpose.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
        <p className="font-mono text-center text-stone-600 dark:text-stone-400 mb-6">
          You have clicked {count} time{count !== 1 ? "s" : ""}.
        </p>
        <div
          ref={containerRef}
          className="relative h-64 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50"
        >
          <button
            type="button"
            onClick={handleClick}
            className="absolute px-6 py-3 font-mono text-sm bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-300 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            style={{
              left: position.x,
              top: position.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            Click me
          </button>
        </div>
      </div>
    </div>
  );
}
