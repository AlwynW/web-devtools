import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardText, MagnifyingGlass } from "phosphor-react";
import { copyToClipboard } from "../utils/clipboard";

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

/** Higher score = better match; -1 = no match. */
function fuzzyScore(query, text) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();

  const idx = t.indexOf(q);
  if (idx >= 0) {
    let score = 1000 - idx;
    if (idx === 0 || "/-— ·".includes(t[idx - 1])) score += 50;
    return score;
  }

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((tok) => t.includes(tok))) {
    return 500 - tokens.reduce((sum, tok) => sum + t.indexOf(tok), 0);
  }

  let qi = 0;
  let consecutive = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      consecutive += 1;
      score += consecutive * 2;
      qi += 1;
    } else {
      consecutive = 0;
    }
  }
  if (qi === q.length) return score;
  return -1;
}

function TimezoneSelect({ value, onChange, zones, id }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const options = useMemo(
    () => zones.map((z) => ({ value: z, label: optionLabel(z) })),
    [zones],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return options;
    return options
      .map((o) => ({ ...o, score: fuzzyScore(q, o.label) }))
      .filter((o) => o.score >= 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const openDropdown = () => {
    setOpen(true);
    setQuery("");
    const selectedIdx = options.findIndex((o) => o.value === value);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pick = (iana) => {
    onChange(iana);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, filtered.length]);

  const onSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      pick(filtered[activeIndex].value);
    }
  };

  const triggerClass =
    "w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100 text-left flex items-center justify-between gap-2";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : openDropdown())}
        className={triggerClass}
      >
        <span className="truncate">{optionLabel(value)}</span>
        <span className="text-stone-400 dark:text-stone-500 shrink-0" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 shadow-lg">
          <div className="relative border-b border-stone-200 dark:border-stone-800">
            <MagnifyingGlass
              size={14}
              weight="thin"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search (e.g. CET, New York, Berlin)"
              className="w-full pl-8 pr-2.5 py-2 bg-white dark:bg-stone-900 font-mono text-xs sm:text-sm focus:outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
              aria-controls={`${id}-listbox`}
              aria-autocomplete="list"
            />
          </div>
          <ul
            id={`${id}-listbox`}
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            className="max-h-56 overflow-y-auto custom-scrollbar"
          >
            {filtered.length === 0 ? (
              <li className="px-2.5 py-3 font-mono text-xs text-stone-500 dark:text-stone-400">
                No timezones match &ldquo;{query.trim()}&rdquo;
              </li>
            ) : (
              filtered.map((o, i) => (
                <li
                  key={o.value}
                  data-index={i}
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => pick(o.value)}
                  className={`px-2.5 py-2 font-mono text-xs sm:text-sm cursor-pointer truncate ${
                    i === activeIndex
                      ? "bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      : o.value === value
                        ? "bg-stone-100 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200"
                        : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
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

function CopyButton({ text, onCopySuccess, title = "Copy to clipboard" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(text, () => {
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className="shrink-0 p-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
    >
      {copied ? (
        <Check size={16} weight="thin" className="text-emerald-500" />
      ) : (
        <ClipboardText size={16} weight="thin" />
      )}
    </button>
  );
}

function ZoneTimeDisplay({ instant, timeZone, onCopySuccess }) {
  const displayed = formatInZone(instant, timeZone);

  return (
    <div className="flex items-start gap-2">
      <div className="font-mono text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-snug break-words flex-1 min-w-0">
        {displayed}
      </div>
      <CopyButton
        text={displayed}
        onCopySuccess={onCopySuccess}
        title="Copy time as displayed"
      />
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

export default function TimezoneConverter({ onToast }) {
  const zones = useMemo(() => getTimeZoneList(), []);
  const defaultTz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const [zoneA, setZoneA] = useState(defaultTz);
  const [zoneB, setZoneB] = useState("UTC");
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

  const unixMs = String(instant.getTime());
  const copyToast = () => onToast?.("Copied!");

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Timezone converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          One moment, two zones. Pick a moment and say whether it is wall-clock
          time in zone A or B. Searchable zone pickers with typical abbreviations
          (ET, CET, PST/PDT, etc.).
        </p>
      </header>

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
          <TimezoneSelect
            id="zone-a-select"
            value={zoneA}
            onChange={setZoneA}
            zones={zones}
          />
          <ZoneTimeDisplay
            instant={instant}
            timeZone={zoneA}
            onCopySuccess={copyToast}
          />
          <ZoneAbbrevRow instant={instant} timeZone={zoneA} />
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 border border-stone-200 dark:border-stone-800 flex flex-col gap-4">
          <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
            Zone B
          </label>
          <TimezoneSelect
            id="zone-b-select"
            value={zoneB}
            onChange={setZoneB}
            zones={zones}
          />
          <ZoneTimeDisplay
            instant={instant}
            timeZone={zoneB}
            onCopySuccess={copyToast}
          />
          <ZoneAbbrevRow instant={instant} timeZone={zoneB} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-500">
        <span>Unix ms: {unixMs}</span>
        <CopyButton
          text={unixMs}
          onCopySuccess={copyToast}
          title="Copy Unix timestamp (ms)"
        />
      </div>
    </div>
  );
}
