import { useState, useEffect } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import SegmentedControl from "../components/ui/SegmentedControl";

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
      <PageHeader title="Timestamp" description="Convert to/from Unix timestamps." />

      <SegmentedControl
        options={[
          { value: "current", label: "Live Clock" },
          { value: "custom", label: "Select Time" },
        ]}
        value={mode}
        onChange={setMode}
        className="mb-6 mx-auto"
      />

      <Panel>
        {mode === "custom" && (
          <div className="mb-6 flex flex-col items-center">
            <Label>
              Local Date & Time
            </Label>
            <input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
        )}
        <div className="text-center mb-2 field-label">
          Unix Epoch
        </div>
        <CopyArea
          text={displayTs}
          onCopySuccess={() => onToast("Timestamp copied!")}
        />
        <div className="mt-6 text-center text-xs font-mono text-fg-subtle">
          UTC:{" "}
          {mode === "current"
            ? new Date().toUTCString()
            : customTs
              ? new Date(customTs * 1000).toUTCString()
              : "-"}
        </div>
      </Panel>
    </div>
  );
}
