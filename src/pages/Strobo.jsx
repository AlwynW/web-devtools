import { useState, useEffect, useRef } from "react";

export default function Strobo() {
  const [speed, setSpeed] = useState(5);
  const [color, setColor] = useState("#ffffff");
  const [active, setActive] = useState(false);
  const [flash, setFlash] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFlash(false);
      return;
    }
    const periodMs = 1000 / speed;
    intervalRef.current = setInterval(() => {
      setFlash((f) => !f);
    }, periodMs / 2);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, speed]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Strobo
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Flashing lights. Adjust speed and color.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
          Warning: Flashing lights may trigger seizures in people with photosensitive epilepsy.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Speed ({speed} Hz)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-40"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-sm text-stone-600 dark:text-stone-400">{color}</span>
            </div>
          </div>
          <button
            onClick={() => setActive((a) => !a)}
            className={`px-6 py-3 font-mono text-sm border transition-colors ${
              active
                ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                : "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border-stone-900 dark:border-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200"
            }`}
          >
            {active ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            backgroundColor: flash ? color : "transparent",
            transition: "none",
          }}
        />
      )}
    </div>
  );
}
