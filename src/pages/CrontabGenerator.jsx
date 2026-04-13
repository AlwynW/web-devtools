import { useState, useMemo } from "react";
import cronstrue from "cronstrue";
import parser from "cron-parser";
import CopyArea from "../components/CopyArea";

const DAYS = [
  { id: "mon", label: "Mon", cron: "1" },
  { id: "tue", label: "Tue", cron: "2" },
  { id: "wed", label: "Wed", cron: "3" },
  { id: "thu", label: "Thu", cron: "4" },
  { id: "fri", label: "Fri", cron: "5" },
  { id: "sat", label: "Sat", cron: "6" },
  { id: "sun", label: "Sun", cron: "0" },
];

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Weekly on Monday 00:00", cron: "0 0 * * 1" },
  { label: "Monthly on 1st at 00:00", cron: "0 0 1 * *" },
];

const NEXT_COUNT = 10;

function analyzeCron(expr) {
  const trimmed = (expr || "").trim();
  if (!trimmed) {
    return { human: "", next: [], err: null };
  }
  try {
    const human = cronstrue.toString(trimmed, { use24HourTimeFormat: true });
    const interval = parser.parseExpression(trimmed, { currentDate: new Date() });
    const next = [];
    for (let i = 0; i < NEXT_COUNT; i++) {
      next.push(interval.next().toDate());
    }
    return { human, next, err: null };
  } catch (e) {
    return {
      human: "",
      next: [],
      err: e.message || "Invalid cron expression",
    };
  }
}

export default function CrontabGenerator({ onToast }) {
  const [preset, setPreset] = useState(null);
  const [minute, setMinute] = useState(0);
  const [hour, setHour] = useState(4);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [custom, setCustom] = useState("");
  const [humanOverride, setHumanOverride] = useState("");

  const cron = useMemo(() => {
    if (preset) return preset;
    if (custom.trim()) return custom.trim();
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }, [preset, custom, minute, hour, dayOfMonth, month, dayOfWeek]);

  const exprForHuman = humanOverride.trim() || cron;
  const { human, next, err } = useMemo(
    () => analyzeCron(exprForHuman),
    [exprForHuman],
  );

  const selectPreset = (p) => {
    setPreset(p.cron);
    setCustom("");
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Crontab Generator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Build cron schedules, humanize them, and preview next run times.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Quick presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.cron}
                type="button"
                onClick={() => selectPreset(p)}
                className={`p-3 border text-left text-sm font-mono transition-colors ${
                  preset === p.cron
                    ? "border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-stone-900"
                    : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"
                }`}
              >
                <div className="text-stone-800 dark:text-stone-200">{p.label}</div>
                <div className="font-mono text-xs text-stone-500 mt-1">
                  {p.cron}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Build custom schedule
          </label>
          <p className="text-xs font-mono text-stone-500 mb-3">
            minute hour day-of-month month day-of-week (0-6, 0=Sun)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Minute
              </label>
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => {
                  setPreset(null);
                  setMinute(parseInt(e.target.value) || 0);
                }}
                className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Hour
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => {
                  setPreset(null);
                  setHour(parseInt(e.target.value) || 0);
                }}
                className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Day (1-31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => {
                  setPreset(null);
                  setDayOfMonth(parseInt(e.target.value) || 1);
                }}
                className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => {
                  setPreset(null);
                  setMonth(e.target.value);
                }}
                className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              >
                <option value="*">* (every)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Day of week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => {
                  setPreset(null);
                  setDayOfWeek(e.target.value);
                }}
                className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              >
                <option value="*">* (every)</option>
                {DAYS.map((d) => (
                  <option key={d.id} value={d.cron}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Or paste custom cron expression
          </label>
          <input
            type="text"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setPreset(null);
            }}
            placeholder="* * * * *"
            className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <CopyArea text={cron} onCopySuccess={() => onToast("Cron copied!")} />

        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 font-mono tracking-tight">
            Humanizer & next runs
          </h3>
          <p className="text-xs font-mono text-stone-500">
            Uses the built expression below unless you override. Standard 5-field
            cron (minute hour dom month dow).
          </p>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Current expression
            </label>
            <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-sm text-stone-800 dark:text-stone-200">
              {cron}
            </pre>
            <button
              type="button"
              onClick={() => setHumanOverride("")}
              className="mt-2 text-[11px] font-mono text-stone-600 dark:text-stone-400 underline hover:text-stone-900 dark:hover:text-stone-200"
            >
              Analyze built expression (clear override)
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Override (optional)
            </label>
            <input
              type="text"
              value={humanOverride}
              onChange={(e) => setHumanOverride(e.target.value)}
              placeholder="Paste any 5-field cron to analyze…"
              className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
            />
          </div>
          {err && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-mono">
              {err}
            </div>
          )}
          {!err && human && (
            <>
              <div>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                  Human-readable
                </label>
                <p className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
                  {human}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                  Next {NEXT_COUNT} runs (local time)
                </label>
                <ul className="font-mono text-xs text-stone-700 dark:text-stone-300 space-y-1 border border-stone-200 dark:border-stone-700 p-3 bg-white dark:bg-stone-900 max-h-48 overflow-y-auto">
                  {next.map((d, i) => (
                    <li key={i}>{d.toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
