import { useState, useEffect, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
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
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          UUID Gen
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Create RFC-compliant UUIDs.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {types.map((t) => (
          <button
            key={t.id}
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

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
        <CopyArea text={uuid} onCopySuccess={() => onToast("UUID copied!")} />
        <div className="mt-4 flex justify-end">
          <Button onClick={generateUuid} icon={ArrowsClockwise}>
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
