import { useEffect, useMemo, useState } from "react";

/** US-focused hints for IANA ids (EST/EDT etc. are location-dependent; shown as typical labels). */
const IANA_US_LABELS = {
  "America/New_York": "ET — Eastern (EST/EDT)",
  "America/Detroit": "ET — Eastern",
  "America/Chicago": "CT — Central (CST/CDT)",
  "America/Denver": "MT — Mountain (MST/MDT)",
  "America/Boise": "MT — Mountain",
  "America/Los_Angeles": "PT — Pacific (PST/PDT)",
  "America/Anchorage": "AK — Alaska (AKST/AKDT)",
  "Pacific/Honolulu": "HI — Hawaii (HST)",
  "America/Phoenix": "MST — Arizona (no DST)",
  "America/Puerto_Rico": "AST — Atlantic",
  "America/Metlakatla": "AK — Alaska",
  "America/Juneau": "AK — Alaska",
  "Pacific/Midway": "SST — Samoa",
  "Pacific/Pago_Pago": "SST — Samoa",
};

/** Quick picks: common US abbreviations → IANA */
const US_PRESETS = [
  { abbr: "ET", iana: "America/New_York", title: "Eastern" },
  { abbr: "CT", iana: "America/Chicago", title: "Central" },
  { abbr: "MT", iana: "America/Denver", title: "Mountain" },
  { abbr: "PT", iana: "America/Los_Angeles", title: "Pacific" },
  { abbr: "AK", iana: "America/Anchorage", title: "Alaska" },
  { abbr: "HI", iana: "Pacific/Honolulu", title: "Hawaii" },
  { abbr: "AZ", iana: "America/Phoenix", title: "Arizona (MST)" },
  { abbr: "AST", iana: "America/Puerto_Rico", title: "Atlantic" },
];

function getTimeZoneList() {
  try {
    if (typeof Intl !== "undefined" && Intl.supportedValuesOf) {
      return Intl.supportedValuesOf("timeZone").sort((a, b) =>
        a.localeCompare(b),
      );
    }
  } catch {
    /* fall through */
  }
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];
}

function formatInZone(date, timeZone, opts = {}) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...opts,
  }).format(date);
}

function tzNamePart(date, timeZone, style) {
  try {
    return (
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: style,
      })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value ?? ""
    );
  } catch {
    return "";
  }
}

function getTimeZoneNameParts(date, timeZone) {
  return {
    short: tzNamePart(date, timeZone, "short"),
    long: tzNamePart(date, timeZone, "long"),
    shortGeneric: tzNamePart(date, timeZone, "shortGeneric"),
  };
}

function optionLabel(iana) {
  const extra = IANA_US_LABELS[iana];
  return extra ? `${iana} — ${extra}` : iana;
}

function ZoneAbbrevRow({ instant, timeZone }) {
  const { short, long, shortGeneric } = getTimeZoneNameParts(instant, timeZone);
  const uniq = [...new Set([shortGeneric, short].filter(Boolean))];
  if (!uniq.length && !long) return null;
  return (
    <p className="text-[12px] font-mono text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
      <span>{uniq.join(" · ")}</span>
      {long ? (
        <span className="text-stone-400 dark:text-stone-500 block sm:inline sm:ml-2">
          {long}
        </span>
      ) : null}
    </p>
  );
}

export default function TimezoneConverter() {
  const zones = useMemo(() => getTimeZoneList(), []);
  const defaultTz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const [zoneA, setZoneA] = useState(defaultTz);
  const [zoneB, setZoneB] = useState("UTC");
  const [presetTarget, setPresetTarget] = useState("A");
  const [mode, setMode] = useState("live");
  const [customLocal, setCustomLocal] = useState("");

  useEffect(() => {
    if (mode === "custom" && !customLocal) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCustomLocal(now.toISOString().slice(0, 16));
    }
  }, [mode, customLocal]);

  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    if (mode !== "live") return;
    const id = setInterval(() => setLiveTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const instant =
    mode === "live"
      ? (liveTick, new Date())
      : !customLocal
        ? new Date()
        : (() => {
            const d = new Date(customLocal);
            return Number.isNaN(d.getTime()) ? new Date() : d;
          })();

  const selectClass =
    "w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Timezone converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          One moment, two zones. Custom time uses your device timezone. US
          zones show ET, PT, PST/PDT, etc. in the dropdown and live readout.
        </p>
      </header>

      <div className="mb-8 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-3 font-mono text-[11px] text-stone-600 dark:text-stone-400">
          <span className="uppercase tracking-[0.14em] text-stone-500 dark:text-stone-500">
            US presets
          </span>
          <span className="text-stone-400 dark:text-stone-600">→</span>
          <label className="sr-only">Apply preset to zone</label>
          <select
            value={presetTarget}
            onChange={(e) => setPresetTarget(e.target.value)}
            className="bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-2 py-1 text-[11px] text-stone-800 dark:text-stone-200"
          >
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {US_PRESETS.map((p) => (
            <button
              key={p.iana + p.abbr}
              type="button"
              title={p.title}
              onClick={() =>
                presetTarget === "A"
                  ? setZoneA(p.iana)
                  : setZoneB(p.iana)
              }
              className="px-2.5 py-1 font-mono text-[11px] border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <span className="font-bold">{p.abbr}</span>
              <span className="text-stone-500 dark:text-stone-500 ml-1 hidden sm:inline">
                {p.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max mb-8 mx-auto font-mono text-[11px]">
        <button
          type="button"
          className={`px-3 py-1.5 transition-colors ${
            mode === "live"
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
              : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          onClick={() => setMode("live")}
        >
          Live
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 transition-colors ${
            mode === "custom"
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
              : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          onClick={() => setMode("custom")}
        >
          Pick a moment
        </button>
      </div>

      {mode === "custom" && (
        <div className="mb-8 flex flex-col items-center">
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Local date &amp; time
          </label>
          <input
            type="datetime-local"
            value={customLocal}
            onChange={(e) => setCustomLocal(e.target.value)}
            className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 border border-stone-200 dark:border-stone-800 flex flex-col gap-4">
          <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Zone A
          </label>
          <select
            value={zoneA}
            onChange={(e) => setZoneA(e.target.value)}
            className={selectClass}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {optionLabel(z)}
              </option>
            ))}
          </select>
          <div className="font-mono text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-snug break-words">
            {formatInZone(instant, zoneA)}
          </div>
          <ZoneAbbrevRow instant={instant} timeZone={zoneA} />
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 border border-stone-200 dark:border-stone-800 flex flex-col gap-4">
          <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Zone B
          </label>
          <select
            value={zoneB}
            onChange={(e) => setZoneB(e.target.value)}
            className={selectClass}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {optionLabel(z)}
              </option>
            ))}
          </select>
          <div className="font-mono text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-snug break-words">
            {formatInZone(instant, zoneB)}
          </div>
          <ZoneAbbrevRow instant={instant} timeZone={zoneB} />
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] font-mono text-stone-500 dark:text-stone-500">
        Unix ms: {instant.getTime()}
      </p>
    </div>
  );
}
