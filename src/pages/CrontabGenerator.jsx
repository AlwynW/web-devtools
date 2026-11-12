import { useState, useMemo } from "react";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

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
    const interval = CronExpressionParser.parse(trimmed, {
      currentDate: new Date(),
    });
    const next = interval.take(NEXT_COUNT).map((d) => d.toDate());
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
      <PageHeader title="Crontab Generator" description="Build cron schedules, humanize them, and preview next run times." />

      <Panel className="space-y-6">
        <div>
          <Label>
            Quick presets
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.cron}
                type="button"
                onClick={() => selectPreset(p)}
                className={`p-3 border rounded-control text-left text-sm font-mono transition-colors ${
                  preset === p.cron
                    ? "border-emphasis bg-shell"
                    : "border-border hover:border-border-strong"
                }`}
              >
                <div className="text-fg-soft">{p.label}</div>
                <div className="font-mono text-xs text-fg-muted mt-1">
                  {p.cron}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>
            Build custom schedule
          </Label>
          <p className="text-xs font-mono text-fg-muted mb-3">
            minute hour day-of-month month day-of-week (0-6, 0=Sun)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="field-label mb-1">
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
                className="w-full p-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div>
              <label className="field-label mb-1">
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
                className="w-full p-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div>
              <label className="field-label mb-1">
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
                className="w-full p-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div>
              <label className="field-label mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => {
                  setPreset(null);
                  setMonth(e.target.value);
                }}
                className="w-full p-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
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
              <label className="field-label mb-1">
                Day of week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => {
                  setPreset(null);
                  setDayOfWeek(e.target.value);
                }}
                className="w-full p-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
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
          <Label>
            Or paste custom cron expression
          </Label>
          <input
            type="text"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setPreset(null);
            }}
            placeholder="* * * * *"
            className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        <CopyArea text={cron} onCopySuccess={() => onToast("Cron copied!")} />

        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-sm font-semibold text-fg-soft font-mono tracking-tight">
            Humanizer & next runs
          </h3>
          <p className="text-xs font-mono text-fg-muted">
            Uses the built expression below unless you override. Standard 5-field
            cron (minute hour dom month dow).
          </p>
          <div>
            <Label>
              Current expression
            </Label>
            <pre className="p-3 bg-surface-code border border-border rounded-control font-mono text-sm text-fg-soft">
              {cron}
            </pre>
            <button
              type="button"
              onClick={() => setHumanOverride("")}
              className="mt-2 text-[11px] font-mono text-fg-muted underline hover:text-fg"
            >
              Analyze built expression (clear override)
            </button>
          </div>
          <div>
            <Label>
              Override (optional)
            </Label>
            <input
              type="text"
              value={humanOverride}
              onChange={(e) => setHumanOverride(e.target.value)}
              placeholder="Paste any 5-field cron to analyze…"
              className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
          {err && (
            <ErrorBanner className="p-3 text-sm font-mono">
              {err}
            </ErrorBanner>
          )}
          {!err && human && (
            <>
              <div>
                <Label>
                  Human-readable
                </Label>
                <p className="p-4 bg-surface-code border border-border rounded-control text-fg-soft text-sm leading-relaxed">
                  {human}
                </p>
              </div>
              <div>
                <Label>
                  Next {NEXT_COUNT} runs (local time)
                </Label>
                <ul className="font-mono text-xs text-fg-soft space-y-1 border border-border rounded-control p-3 bg-surface max-h-48 overflow-y-auto">
                  {next.map((d, i) => (
                    <li key={i}>{d.toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
