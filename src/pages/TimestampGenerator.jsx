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
        <h2 className="text-4xl font-black mb-2 tracking-tight">Timestamp</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Professional grade utility for daily development.
        </p>
      </header>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max mb-6 mx-auto">
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === "current" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          onClick={() => setMode("current")}
        >
          Live Clock
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === "custom" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          onClick={() => setMode("custom")}
        >
          Select Time
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        {mode === "custom" && (
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Local Date & Time
            </label>
            <input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>
        )}
        <div className="text-center mb-2 text-sm text-slate-500 uppercase tracking-widest font-bold">
          Unix Epoch
        </div>
        <CopyArea
          text={displayTs}
          onCopySuccess={() => onToast("Timestamp copied!")}
        />
        <div className="mt-6 text-center text-xs text-slate-400 font-mono">
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
