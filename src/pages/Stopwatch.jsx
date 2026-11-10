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
          <div className="fixed inset-0 z-[9999] flex flex-col bg-stage text-fg-strong">
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-border-strong/50">
              <button
                type="button"
                onClick={() => setImmersive(false)}
                className="font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 border border-border-muted hover:bg-secondary-hover"
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
                <p className="mt-6 font-mono text-fg-muted text-sm tabular-nums">
                  Last lap {formatElapsed(laps[0].lapMs)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-5 border-t border-border-strong/50 font-mono text-xs sm:text-sm shrink-0">
              {!running ? (
                <button
                  type="button"
                  onClick={start}
                  className="px-5 py-2.5 bg-inverse text-inverse-fg rounded-button border border-border-strong"
                >
                  Start
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pause}
                  className="px-5 py-2.5 bg-inverse text-inverse-fg rounded-button border border-border-strong"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={lap}
                disabled={!running}
                className="px-5 py-2.5 border border-border-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Lap
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-5 py-2.5 border border-border-muted"
              >
                Reset
              </button>
            </div>
            <p className="text-center font-mono text-[10px] text-fg-muted pb-3 shrink-0">
              Esc to exit
            </p>
          </div>,
          document.body,
        )}

      {!immersive && (
        <div className="w-full max-w-[100vw] mx-auto px-0 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-8 sm:mb-12 text-center px-4">
            <h2 className="text-4xl font-black mb-2 tracking-tight text-fg-strong">
              Stopwatch
            </h2>
            <p className="text-[13px] font-mono text-fg-muted">
              Start, pause, lap. High-resolution display.
            </p>
            <button
              type="button"
              onClick={() => setImmersive(true)}
              className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 border border-border-strong text-fg-soft hover:bg-secondary-hover"
            >
              <ArrowsOut size={16} weight="thin" />
              Full browser width
            </button>
          </header>

          <div className="w-full border-y border-border bg-surface py-6 sm:py-10 mb-8">
            <div
              className="font-mono font-bold text-fg-strong text-center tracking-tight tabular-nums leading-none select-none px-2"
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
                className="px-5 py-2.5 bg-inverse text-inverse-fg rounded-button border border-border-strong hover:opacity-90"
              >
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                className="px-5 py-2.5 bg-inverse text-inverse-fg rounded-button border border-border-strong hover:opacity-90"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={lap}
              disabled={!running}
              className="px-5 py-2.5 border border-border-strong bg-surface text-fg-soft disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hover-muted"
            >
              Lap
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-5 py-2.5 border border-border-strong bg-surface text-fg-soft hover:bg-hover-muted"
            >
              Reset
            </button>
          </div>

          {laps.length > 0 && (
            <div className="max-w-xl mx-auto px-4">
              <h3 className="field-label mb-3">
                Laps
              </h3>
              <ul className="border border-border divide-y divide-border bg-surface font-mono text-sm">
                <li className="flex justify-between gap-4 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-fg-muted">
                  <span className="w-8">#</span>
                  <span>Lap</span>
                  <span>Total</span>
                </li>
                {laps.map((lapRow) => (
                  <li
                    key={lapRow.index}
                    className="flex justify-between gap-4 px-4 py-2.5 text-fg-soft"
                  >
                    <span className="text-fg-muted w-8">
                      {lapRow.index}
                    </span>
                    <span className="tabular-nums">{formatElapsed(lapRow.lapMs)}</span>
                    <span className="tabular-nums text-fg-muted">
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
