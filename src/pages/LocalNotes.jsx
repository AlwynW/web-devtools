import { useState, useEffect } from "react";
import { copyToClipboard } from "../utils/clipboard";

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

  const copy = (text) => {
    copyToClipboard(text, () => onToast?.("Copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Local Notes
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Store notes in your browser. Add and remove. Saved in localStorage.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a note..."
            className="flex-1 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
          <button
            onClick={add}
            className="px-6 py-2 bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-900 dark:border-stone-100 font-mono text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {notes.length === 0 && (
            <p className="text-center py-8 font-mono text-stone-500 dark:text-stone-400 text-sm">
              No notes yet. Add one above.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-3 p-4 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50"
            >
              <span className="flex-1 font-mono text-sm text-stone-800 dark:text-stone-200">
                {note.text}
              </span>
              <button
                onClick={() => copy(note.text)}
                className="px-3 py-1 font-mono text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-300 dark:border-stone-600 hover:border-stone-400 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => remove(note.id)}
                className="px-3 py-1 font-mono text-xs text-stone-500 hover:text-red-600 dark:hover:text-red-400 border border-stone-300 dark:border-stone-600 hover:border-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
