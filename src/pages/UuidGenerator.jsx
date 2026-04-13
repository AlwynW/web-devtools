import { useState, useMemo } from "react";
import { ArrowsClockwise } from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { copyToClipboard } from "../utils/clipboard";
import { generateUUIDv1, generateUUIDv4, generateUUIDv7 } from "../utils/uuid";

const MAX_BULK = 500;

function makeOne(uuidType) {
  switch (uuidType) {
    case "v1":
      return generateUUIDv1();
    case "v4":
      return generateUUIDv4();
    case "v7":
      return generateUUIDv7();
    case "nil":
      return "00000000-0000-0000-0000-000000000000";
    case "guid":
      return `{${generateUUIDv4().toUpperCase()}}`;
    default:
      return generateUUIDv4();
  }
}

export default function UuidGenerator({ onToast }) {
  const [uuidType, setUuidType] = useState("v4");
  const [count, setCount] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const safeCount = Math.min(
    MAX_BULK,
    Math.max(1, Number.isFinite(count) ? Math.floor(count) : 1),
  );

  const { uuid, bulkText } = useMemo(() => {
    void refreshKey;
    if (safeCount <= 1) {
      return { uuid: makeOne(uuidType), bulkText: "" };
    }
    const lines = [];
    for (let i = 0; i < safeCount; i++) lines.push(makeOne(uuidType));
    return { uuid: lines[0] || "", bulkText: lines.join("\n") };
  }, [uuidType, safeCount, refreshKey]);

  const types = useMemo(
    () => [
      { id: "v1", name: "Version 1", desc: "Time-based" },
      { id: "v4", name: "Version 4", desc: "Random" },
      { id: "v7", name: "Version 7", desc: "Time-ordered" },
      { id: "guid", name: "GUID", desc: "Microsoft" },
      { id: "nil", name: "Nil/Empty", desc: "All zeros" },
    ],
    [],
  );

  const copyAll = () => {
    const text = safeCount <= 1 ? uuid : bulkText;
    if (!text) return;
    copyToClipboard(text, () => onToast("Copied!"));
  };

  const regenerate = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          UUID Gen
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Create RFC-compliant UUIDs. Bulk-generate up to {MAX_BULK}.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setUuidType(t.id)}
            className={`p-3 border text-left transition-colors font-mono text-sm ${
              uuidType === t.id
                ? "border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-stone-900"
                : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"
            }`}
          >
            <div
              className={`font-semibold ${uuidType === t.id ? "text-stone-900 dark:text-stone-100" : "text-stone-700 dark:text-stone-200"}`}
            >
              {t.name}
            </div>
            <div className="text-xs text-stone-500 mt-1">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Count (1–{MAX_BULK})
          </label>
          <input
            type="number"
            min={1}
            max={MAX_BULK}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
            className="w-full max-w-[12rem] p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
          />
        </div>

        {safeCount <= 1 ? (
          <CopyArea text={uuid} onCopySuccess={() => onToast("UUID copied!")} />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                Output ({safeCount} lines)
              </label>
              <button
                type="button"
                onClick={copyAll}
                className="text-[11px] font-mono px-3 py-1 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
              >
                Copy all
              </button>
            </div>
            <textarea
              readOnly
              value={bulkText}
              rows={Math.min(16, Math.max(6, safeCount))}
              className="w-full p-4 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 font-mono text-sm text-stone-900 dark:text-stone-100 resize-y min-h-[8rem]"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={regenerate} icon={ArrowsClockwise}>
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
