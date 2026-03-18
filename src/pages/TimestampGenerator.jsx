import { useState, useEffect } from "react";
import CopyArea from "../components/CopyArea";

export default function TimestampGenerator({ onToast }) {
  const [mode, setMode] = useState("current");
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    if (mode !== "current") return;
    const interval = setInterval(
      () => setCurrentTs(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (mode === "custom" && !customDate) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCustomDate(now.toISOString().slice(0, 16));
    }
  }, [mode, customDate]);

  const customTs = customDate
    ? Math.floor(new Date(customDate).getTime() / 1000)
    : "";
  const displayTs =
    mode === "current"
      ? currentTs.toString()
      : (customTs || "Invalid Date").toString();

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Timestamp
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert to/from Unix timestamps.
        </p>
      </header>

      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max mb-6 mx-auto font-mono text-[11px]">
        <button
          className={`px-3 py-1.5 transition-colors ${
            mode === "current"
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
              : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          onClick={() => setMode("current")}
        >
          Live Clock
        </button>
        <button
          className={`px-3 py-1.5 transition-colors ${
            mode === "custom"
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
              : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          onClick={() => setMode("custom")}
        >
          Select Time
        </button>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
        {mode === "custom" && (
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Local Date & Time
            </label>
            <input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
        )}
        <div className="text-center mb-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
          Unix Epoch
        </div>
        <CopyArea
          text={displayTs}
          onCopySuccess={() => onToast("Timestamp copied!")}
        />
        <div className="mt-6 text-center text-xs font-mono text-stone-400">
          UTC:{" "}
          {mode === "current"
            ? new Date().toUTCString()
            : customTs
              ? new Date(customTs * 1000).toUTCString()
              : "-"}
        </div>
      </div>
    </div>
  );
}
