import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsOut } from "phosphor-react";
import { useImmersiveView } from "../hooks/useImmersiveView";

function formatElapsed(ms) {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const frac = Math.floor(ms % 1000);
  const pad = (n, w) => n.toString().padStart(w, "0");
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(frac, 3)}`;
}

export default function Stopwatch() {
  const [immersive, setImmersive] = useImmersiveView();
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState([]);

  const baseMsRef = useRef(0);
  const startPerfRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startPerfRef.current = performance.now();
    let frame = 0;
    const loop = () => {
      const now = performance.now();
      setElapsedMs(baseMsRef.current + (now - startPerfRef.current));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const start = () => {
    if (running) return;
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    const now = performance.now();
    baseMsRef.current = baseMsRef.current + (now - startPerfRef.current);
    setElapsedMs(baseMsRef.current);
    setRunning(false);
  };

  const reset = () => {
    baseMsRef.current = 0;
    setElapsedMs(0);
    setRunning(false);
    setLaps([]);
  };

  const lap = () => {
    if (!running) return;
    const now = performance.now();
    const total = baseMsRef.current + (now - startPerfRef.current);
    setElapsedMs(total);
    setLaps((prev) => {
      const lastTotal = prev.length ? prev[0].totalMs : 0;
      const lapMs = total - lastTotal;
      return [{ index: prev.length + 1, totalMs: total, lapMs }, ...prev];
    });
  };

  return (
    <>
      {immersive &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-50">
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-stone-300/50 dark:border-stone-700/80">
              <button
                type="button"
                onClick={() => setImmersive(false)}
                className="font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 border border-stone-400 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                Exit full width
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-3 py-6">
              <div
                className="font-mono font-bold text-center tracking-tight tabular-nums leading-none select-none w-full max-w-[100vw]"
                style={{ fontSize: "clamp(2.5rem, 14vw, 10rem)" }}
              >
                {formatElapsed(elapsedMs)}
              </div>
              {laps.length > 0 && (
                <p className="mt-6 font-mono text-stone-500 dark:text-stone-400 text-sm tabular-nums">
                  Last lap {formatElapsed(laps[0].lapMs)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-5 border-t border-stone-300/50 dark:border-stone-700/80 font-mono text-xs sm:text-sm shrink-0">
              {!running ? (
                <button
                  type="button"
                  onClick={start}
                  className="px-5 py-2.5 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 border border-stone-700 dark:border-stone-300"
                >
                  Start
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pause}
                  className="px-5 py-2.5 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 border border-stone-700 dark:border-stone-300"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={lap}
                disabled={!running}
                className="px-5 py-2.5 border border-stone-400 dark:border-stone-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Lap
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-5 py-2.5 border border-stone-400 dark:border-stone-600"
              >
                Reset
              </button>
            </div>
            <p className="text-center font-mono text-[10px] text-stone-500 pb-3 shrink-0">
              Esc to exit
            </p>
          </div>,
          document.body,
        )}

      {!immersive && (
        <div className="w-full max-w-[100vw] mx-auto px-0 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-8 sm:mb-12 text-center px-4">
            <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
              Stopwatch
            </h2>
            <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
              Start, pause, lap. High-resolution display.
            </p>
            <button
              type="button"
              onClick={() => setImmersive(true)}
              className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <ArrowsOut size={16} weight="thin" />
              Full browser width
            </button>
          </header>

          <div className="w-full border-y border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 sm:py-10 mb-8">
            <div
              className="font-mono font-bold text-stone-900 dark:text-stone-50 text-center tracking-tight tabular-nums leading-none select-none px-2"
              style={{ fontSize: "clamp(1.75rem, 8vw, 5rem)" }}
            >
              {formatElapsed(elapsedMs)}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 px-4 font-mono text-xs sm:text-sm">
            {!running ? (
              <button
                type="button"
                onClick={start}
                className="px-5 py-2.5 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 border border-stone-700 dark:border-stone-300 hover:opacity-90"
              >
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                className="px-5 py-2.5 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 border border-stone-700 dark:border-stone-300 hover:opacity-90"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={lap}
              disabled={!running}
              className="px-5 py-2.5 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Lap
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-5 py-2.5 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Reset
            </button>
          </div>

          {laps.length > 0 && (
            <div className="max-w-xl mx-auto px-4">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400 mb-3">
                Laps
              </h3>
              <ul className="border border-stone-200 dark:border-stone-800 divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900 font-mono text-sm">
                <li className="flex justify-between gap-4 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-stone-500 dark:text-stone-500">
                  <span className="w-8">#</span>
                  <span>Lap</span>
                  <span>Total</span>
                </li>
                {laps.map((lapRow) => (
                  <li
                    key={lapRow.index}
                    className="flex justify-between gap-4 px-4 py-2.5 text-stone-800 dark:text-stone-200"
                  >
                    <span className="text-stone-500 dark:text-stone-500 w-8">
                      {lapRow.index}
                    </span>
                    <span className="tabular-nums">{formatElapsed(lapRow.lapMs)}</span>
                    <span className="tabular-nums text-stone-500 dark:text-stone-400">
                      {formatElapsed(lapRow.totalMs)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
