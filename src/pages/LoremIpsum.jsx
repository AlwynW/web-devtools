import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { faker } from "@faker-js/faker";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Lorem Ipsum
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Generate placeholder text for your projects.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max flex-wrap">
          {[
            { id: "paragraphs", label: "Paragraphs" },
            { id: "sentences", label: "Sentences" },
            { id: "words", label: "Words" },
          ].map((m) => (
            <button
              key={m.id}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === m.id ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Count
          </label>
          <input
            type="number"
            min="1"
            max={mode === "words" ? 100 : 20}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <Button onClick={generate} icon={RefreshCw}>
          Generate
        </Button>

        {output && (
          <>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Output
            </label>
            <CopyArea
              text={output}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </div>
    </div>
  );
}
