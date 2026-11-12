import { useState, useEffect } from "react";
import CopyButton from "../components/CopyButton";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Button from "../components/Button";

const STORAGE_KEY = "devkit-local-notes";

export default function LocalNotes({ onToast }) {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setNotes(parsed);
      }
    } catch {
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setNotes((prev) => [...prev, { id: Date.now(), text }]);
    setInput("");
    onToast?.("Note added");
  };

  const remove = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    onToast?.("Note removed");
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Local Notes" description="Store notes in your browser. Add and remove. Saved in localStorage." />

      <Panel className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a note..."
            className="flex-1 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
          <Button onClick={add}>Add</Button>
        </div>

        <div className="space-y-2">
          {notes.length === 0 && (
            <p className="text-center py-8 font-mono text-fg-muted text-sm">
              No notes yet. Add one above.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-3 p-4 border border-border rounded-control bg-surface-muted/50"
            >
              <span className="flex-1 font-mono text-sm text-fg-soft">
                {note.text}
              </span>
              <CopyButton
                text={note.text}
                onCopySuccess={() => onToast?.("Copied!")}
                size={16}
              />
              <button
                onClick={() => remove(note.id)}
                className="px-3 py-1 font-mono text-xs text-fg-muted hover:text-red-600 dark:hover:text-red-400 border border-border-strong rounded-button hover:border-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
