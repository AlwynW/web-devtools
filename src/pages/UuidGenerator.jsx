import { useState, useMemo } from "react";
import { ArrowsClockwise } from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import CopyButton from "../components/CopyButton";
import { generateUUIDv1, generateUUIDv4, generateUUIDv7 } from "../utils/uuid";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

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

  const regenerate = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="UUID Gen" description={<>Create RFC-compliant UUIDs. Bulk-generate up to {MAX_BULK}.</>} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setUuidType(t.id)}
            className={`p-3 border rounded-control text-left transition-colors font-mono text-sm ${
              uuidType === t.id
                ? "border-emphasis bg-shell"
                : "border-border hover:border-border-strong"
            }`}
          >
            <div
              className={`font-semibold ${uuidType === t.id ? "text-fg" : "text-fg-soft"}`}
            >
              {t.name}
            </div>
            <div className="text-xs text-fg-muted mt-1">{t.desc}</div>
          </button>
        ))}
      </div>

      <Panel className="space-y-4">
        <div>
          <Label>
            Count (1–{MAX_BULK})
          </Label>
          <input
            type="number"
            min={1}
            max={MAX_BULK}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
            className="w-full max-w-[12rem] p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {safeCount <= 1 ? (
          <CopyArea text={uuid} onCopySuccess={() => onToast("UUID copied!")} />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>
                Output ({safeCount} lines)
              </Label>
              <CopyButton
                text={bulkText}
                onCopySuccess={() => onToast("Copied!")}
                title="Copy all"
                size={16}
              />
            </div>
            <textarea
              readOnly
              value={bulkText}
              rows={Math.min(16, Math.max(6, safeCount))}
              className="w-full p-4 bg-surface-code border border-border-strong rounded-control font-mono text-sm text-fg resize-y min-h-[8rem]"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={regenerate} icon={ArrowsClockwise}>
            Regenerate
          </Button>
        </div>
      </Panel>
    </div>
  );
}
