import { useState, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { faker } from "@faker-js/faker";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

export default function LoremIpsum({ onToast }) {
  const [mode, setMode] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    if (mode === "paragraphs") {
      setOutput(faker.lorem.paragraphs(count, "\n\n"));
    } else if (mode === "sentences") {
      setOutput(faker.lorem.sentences(count));
    } else {
      setOutput(faker.lorem.words(count));
    }
  }, [mode, count]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Lorem Ipsum" description="Generate placeholder text for your projects." />

      <Panel className="space-y-4">
        <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control w-max font-mono text-[11px] flex-wrap">
          {[
            { id: "paragraphs", label: "Paragraphs" },
            { id: "sentences", label: "Sentences" },
            { id: "words", label: "Words" },
          ].map((m) => (
            <button
              key={m.id}
              className={`px-3 py-1.5 transition-colors ${
                mode === m.id
                  ? "bg-primary text-primary-fg border border-primary-border rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div>
          <Label>
            Count
          </Label>
          <input
            type="number"
            min="1"
            max={mode === "words" ? 100 : 20}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 p-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        <Button onClick={generate} icon={ArrowsClockwise}>
          Generate
        </Button>

        {output && (
          <>
            <Label>
              Output
            </Label>
            <CopyArea
              text={output}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
