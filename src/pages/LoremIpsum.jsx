import { useState, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { faker } from "@faker-js/faker";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import SegmentedControl from "../components/ui/SegmentedControl";

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
        <SegmentedControl
          options={[
            { value: "paragraphs", label: "Paragraphs" },
            { value: "sentences", label: "Sentences" },
            { value: "words", label: "Words" },
          ]}
          value={mode}
          onChange={setMode}
        />

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
