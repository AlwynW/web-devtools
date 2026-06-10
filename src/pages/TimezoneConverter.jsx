import { useEffect, useMemo, useState } from "react";

/** Hints for IANA ids (abbreviations are location-dependent; shown as typical labels). */
const IANA_EXTRA_LABELS = {
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
  "Europe/Berlin": "CET/CEST — Central European",
  "Europe/Paris": "CET/CEST — Central European",
  "Europe/Amsterdam": "CET/CEST — Central European",
  "Europe/London": "GMT/BST — UK",
  "Europe/Dublin": "GMT/IST — Ireland",
  "Europe/Lisbon": "WET/WEST — Western European",
  "Europe/Helsinki": "EET/EEST — Eastern European",
  "Europe/Athens": "EET/EEST — Eastern European",
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

/** Quick picks: common European abbreviations → IANA */
const EU_PRESETS = [
  { abbr: "CET", iana: "Europe/Berlin", title: "Central European" },
  { abbr: "GMT", iana: "Europe/London", title: "Greenwich / UK" },
  { abbr: "WET", iana: "Europe/Lisbon", title: "Western European" },
  { abbr: "EET", iana: "Europe/Helsinki", title: "Eastern European" },
  { abbr: "UTC", iana: "UTC", title: "Coordinated Universal" },
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
  const extra = IANA_EXTRA_LABELS[iana];
  return extra ? `${iana} — ${extra}` : iana;
}

function wallClockPartsInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Format a Date as YYYY-MM-DDTHH:mm in the given IANA zone (for datetime-local). */
function formatDatetimeLocalInZone(date, timeZone) {
  const { year, month, day, hour, minute } = wallClockPartsInZone(
    date,
    timeZone,
  );
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/** Parse YYYY-MM-DDTHH:mm as wall-clock time in an IANA zone → UTC instant. */
function parseWallClockInZone(isoLocal, timeZone) {
  const [datePart, timePart = "00:00"] = isoLocal.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi, s = 0] = timePart.split(":").map(Number);
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return new Date(NaN);

  const desiredUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  let utcMs = desiredUtc;

  for (let i = 0; i < 4; i++) {
    const actual = wallClockPartsInZone(new Date(utcMs), timeZone);
    const actualUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    const diff = desiredUtc - actualUtc;
    if (diff === 0) break;
    utcMs += diff;
  }

  return new Date(utcMs);
}

function PresetButtons({ presets, presetTarget, onApply }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
      {presets.map((p) => (
        <button
          key={p.iana + p.abbr}
          type="button"
          title={p.title}
          onClick={() => onApply(p.iana)}
          className="px-2.5 py-1 font-mono text-[11px] border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800"
        >
          <span className="font-bold">{p.abbr}</span>
          <span className="text-stone-500 dark:text-stone-500 ml-1 hidden sm:inline">
            {p.title}
          </span>
        </button>
      ))}
    </div>
  );
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
  const [customTimeSource, setCustomTimeSource] = useState("A");

  const customSourceZone = customTimeSource === "A" ? zoneA : zoneB;

  useEffect(() => {
    if (mode === "custom" && !customLocal) {
      setCustomLocal(formatDatetimeLocalInZone(new Date(), customSourceZone));
    }
  }, [mode, customLocal, customSourceZone]);

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
            const d = parseWallClockInZone(customLocal, customSourceZone);
            return Number.isNaN(d.getTime()) ? new Date() : d;
          })();

  const applyPreset = (iana) =>
    presetTarget === "A" ? setZoneA(iana) : setZoneB(iana);

  const selectClass =
    "w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Timezone converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          One moment, two zones. Pick a moment and say whether it is wall-clock
          time in zone A or B. US and European quick picks; dropdowns show
          typical abbreviations (ET, CET, PST/PDT, etc.).
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
        <PresetButtons
          presets={US_PRESETS}
          presetTarget={presetTarget}
          onApply={applyPreset}
        />
        <div className="flex flex-wrap items-center gap-2 mt-4 mb-3 font-mono text-[11px] text-stone-600 dark:text-stone-400">
          <span className="uppercase tracking-[0.14em] text-stone-500 dark:text-stone-500">
            Europe presets
          </span>
        </div>
        <PresetButtons
          presets={EU_PRESETS}
          presetTarget={presetTarget}
          onApply={applyPreset}
        />
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
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
            <label
              htmlFor="custom-time-source"
              className="text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]"
            >
              Date &amp; time in
            </label>
            <select
              id="custom-time-source"
              value={customTimeSource}
              onChange={(e) => setCustomTimeSource(e.target.value)}
              className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400"
            >
              <option value="A">Zone A — {zoneA}</option>
              <option value="B">Zone B — {zoneB}</option>
            </select>
          </div>
          <input
            type="datetime-local"
            value={customLocal}
            onChange={(e) => setCustomLocal(e.target.value)}
            className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
          <p className="text-[11px] font-mono text-stone-500 dark:text-stone-500 text-center max-w-md">
            Wall-clock time in{" "}
            <span className="text-stone-700 dark:text-stone-300">
              {customSourceZone}
            </span>
            , converted to the other zone.
          </p>
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
