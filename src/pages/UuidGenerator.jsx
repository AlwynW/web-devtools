import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { generateUUIDv1, generateUUIDv4, generateUUIDv7 } from "../utils/uuid";

export default function UuidGenerator({ onToast }) {
  const [uuidType, setUuidType] = useState("v4");
  const [uuid, setUuid] = useState("");

  const generateUuid = useCallback(() => {
    switch (uuidType) {
      case "v1":
        setUuid(generateUUIDv1());
        break;
      case "v4":
        setUuid(generateUUIDv4());
        break;
      case "v7":
        setUuid(generateUUIDv7());
        break;
      case "nil":
        setUuid("00000000-0000-0000-0000-000000000000");
        break;
      case "guid":
        setUuid(`{${generateUUIDv4().toUpperCase()}}`);
        break;
      default:
        setUuid(generateUUIDv4());
    }
  }, [uuidType]);

  useEffect(() => {
    generateUuid();
  }, [generateUuid]);

  const types = [
    { id: "v1", name: "Version 1", desc: "Time-based" },
    { id: "v4", name: "Version 4", desc: "Random" },
    { id: "v7", name: "Version 7", desc: "Time-ordered" },
    { id: "guid", name: "GUID", desc: "Microsoft" },
    { id: "nil", name: "Nil/Empty", desc: "All zeros" },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">UUID Gen</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Professional grade utility for daily development.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setUuidType(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              uuidType === t.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500"
            }`}
          >
            <div
              className={`font-semibold ${uuidType === t.id ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"}`}
            >
              {t.name}
            </div>
            <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <CopyArea text={uuid} onCopySuccess={() => onToast("UUID copied!")} />
        <div className="mt-4 flex justify-end">
          <Button onClick={generateUuid} icon={RefreshCw}>
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
