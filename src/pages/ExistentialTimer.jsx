import { useState, useEffect } from "react";

const MESSAGES = [
  "You've been here {time}. Why?",
  "{time}. Still no answers.",
  "Time passes. So do you.",
  "{time} of your life. Gone.",
  "The void is patient. You are not.",
  "{time}. Existential dread loading...",
  "Every second brings you closer. To what? Unknown.",
  "{time}. You could have done something. You didn't.",
  "The clock ticks. So does your mortality.",
  "{time}. Meaning not found.",
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}`;
}

function getMessage(seconds) {
  const timeStr = formatTime(seconds);
  const msg = MESSAGES[seconds % MESSAGES.length];
  return msg.replace("{time}", timeStr);
}

export default function ExistentialTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Existential Timer
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Counts seconds. Asks questions. Provides no answers.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-12 border border-stone-200 dark:border-stone-800 text-center">
        <div className="font-mono text-6xl font-bold text-stone-800 dark:text-stone-200 mb-6">
          {formatTime(seconds)}
        </div>
        <p className="font-mono text-lg text-stone-600 dark:text-stone-400 italic">
          {getMessage(seconds)}
        </p>
      </div>
    </div>
  );
}
