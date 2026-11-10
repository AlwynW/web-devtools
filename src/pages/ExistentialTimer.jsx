import { useState, useEffect } from "react";
import PageHeader from "../components/ui/PageHeader";

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
      <PageHeader title="Existential Timer" description="Counts seconds. Asks questions. Provides no answers." />

      <div className="bg-surface p-12 border border-border text-center">
        <div className="font-mono text-6xl font-bold text-fg-soft mb-6">
          {formatTime(seconds)}
        </div>
        <p className="font-mono text-lg text-fg-muted italic">
          {getMessage(seconds)}
        </p>
      </div>
    </div>
  );
}
