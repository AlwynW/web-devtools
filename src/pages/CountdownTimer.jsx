import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsOut } from "phosphor-react";
import { useImmersiveView } from "../hooks/useImmersiveView";
import Panel from "../components/ui/Panel";

function parseInputs(h, m, s) {
  const hh = Math.max(0, Math.min(99, Number(h) || 0));
  const mm = Math.max(0, Math.min(59, Number(m) || 0));
  const ss = Math.max(0, Math.min(59, Number(s) || 0));
  return (hh * 3600 + mm * 60 + ss) * 1000;
}

function formatRemaining(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function CountdownTimer() {
  const [immersive, setImmersive] = useImmersiveView();
  const [h, setH] = useState(0);
  const [m, setM] = useState(5);
  const [s, setS] = useState(0);
  const [remainingMs, setRemainingMs] = useState(() =>
    parseInputs(0, 5, 0),
  );
  const [running, setRunning] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const endAtRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      const left = endAtRef.current - performance.now();
      if (left <= 0) {
        setRemainingMs(0);
        setRunning(false);
        setAlarm(true);
        return;
      }
      setRemainingMs(left);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  useEffect(() => {
    if (!alarm) return;
    const id = setInterval(() => setFlashOn((v) => !v), 280);
    return () => clearInterval(id);
  }, [alarm]);

  const applyDuration = () => {
    const ms = parseInputs(h, m, s);
    setRemainingMs(ms);
    setRunning(false);
    setAlarm(false);
  };

  const start = () => {
    let ms = remainingMs;
    if (ms <= 0) {
      ms = parseInputs(h, m, s);
      setRemainingMs(ms);
    }
    if (ms <= 0) return;
    setAlarm(false);
    endAtRef.current = performance.now() + ms;
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    setRemainingMs(Math.max(0, endAtRef.current - performance.now()));
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setAlarm(false);
    const ms = parseInputs(h, m, s);
    setRemainingMs(ms);
  };

  const dismissAlarm = () => {
    setAlarm(false);
    setFlashOn(false);
    const ms = parseInputs(h, m, s);
    setRemainingMs(ms);
  };

  return (
    <>
      {alarm &&
        createPortal(
          <div
            className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 p-6 transition-colors duration-75 ${
              flashOn
                ? "bg-white text-black dark:bg-black dark:text-white"
                : "bg-black dark:bg-white text-white dark:text-black"
            }`}
          >
            <p className="font-black text-4xl sm:text-5xl tracking-tight text-center">
              Time&apos;s up
            </p>
            <button
              type="button"
              onClick={dismissAlarm}
              className="px-8 py-3 font-mono text-sm border-2 border-current hover:opacity-80"
            >
              Dismiss
            </button>
            <p className="text-[11px] font-mono max-w-md text-center opacity-80">
              Flashing may affect photosensitive viewers. Press Dismiss to stop.
            </p>
          </div>,
          document.body,
        )}

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
                className="font-mono font-bold text-center tabular-nums leading-none select-none w-full max-w-[100vw]"
                style={{ fontSize: "clamp(3rem, 16vw, 11rem)" }}
              >
                {formatRemaining(remainingMs)}
              </div>
              {!running && (
                <div className="mt-10 flex flex-wrap items-end justify-center gap-4 font-mono text-xs max-w-md">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                      H
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={h}
                      onChange={(e) => setH(e.target.value)}
                      className="w-16 p-2 bg-surface border border-border-muted text-center text-fg"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                      M
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={m}
                      onChange={(e) => setM(e.target.value)}
                      className="w-16 p-2 bg-surface border border-border-muted text-center text-fg"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                      S
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={s}
                      onChange={(e) => setS(e.target.value)}
                      className="w-16 p-2 bg-surface border border-border-muted text-center text-fg"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={applyDuration}
                    className="mb-0.5 px-3 py-2 border border-border-muted text-[11px] uppercase tracking-[0.1em]"
                  >
                    Apply
                  </button>
                </div>
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
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          <header className="mb-12 text-center">
            <h2 className="text-4xl font-black mb-2 tracking-tight text-fg-strong">
              Countdown
            </h2>
            <p className="text-[13px] font-mono text-fg-muted">
              Set hours, minutes, seconds. At zero the screen flashes until dismissed.
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

          <Panel className="space-y-8">
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto font-mono text-xs">
              <div>
                <label className="block text-[11px] text-fg-muted uppercase tracking-[0.18em] mb-2">
                  Hours
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={h}
                  disabled={running}
                  onChange={(e) => setH(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-strong text-center text-fg disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-fg-muted uppercase tracking-[0.18em] mb-2">
                  Min
                </label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={m}
                  disabled={running}
                  onChange={(e) => setM(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-strong text-center text-fg disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-fg-muted uppercase tracking-[0.18em] mb-2">
                  Sec
                </label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={s}
                  disabled={running}
                  onChange={(e) => setS(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-strong text-center text-fg disabled:opacity-50"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="font-mono text-5xl sm:text-6xl font-bold text-fg-soft tabular-nums">
                {formatRemaining(remainingMs)}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 font-mono text-xs sm:text-sm">
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
                onClick={reset}
                className="px-5 py-2.5 border border-border-strong bg-surface"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyDuration}
                disabled={running}
                className="px-5 py-2.5 border border-border-strong bg-surface disabled:opacity-40"
              >
                Set duration
              </button>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
