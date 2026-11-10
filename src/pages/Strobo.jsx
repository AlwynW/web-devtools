import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

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
      <PageHeader title="Strobo" description="Flashing lights. Adjust speed and color." />

      <Panel className="space-y-6">
        <p className="text-xs font-mono text-favorite">
          Warning: Flashing lights may trigger seizures in people with photosensitive epilepsy.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <Label>
              Speed ({speed} Hz)
            </Label>
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
            <Label>
              Color
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 border border-border-strong cursor-pointer bg-transparent"
              />
              <span className="font-mono text-sm text-fg-muted">{color}</span>
            </div>
          </div>
          <button
            onClick={() => setActive((a) => !a)}
            className={`px-6 py-3 font-mono text-sm border transition-colors ${
              active
                ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                : "bg-primary text-primary-fg border-primary-border hover:bg-primary-hover rounded-button"
            }`}
          >
            {active ? "Stop" : "Start"}
          </button>
        </div>
      </Panel>

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
