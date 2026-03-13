import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";

const CopyArea = ({ text, onCopySuccess }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(text, () => {
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group mt-4">
      <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 pr-16 text-lg font-mono text-slate-800 dark:text-slate-100 break-words whitespace-pre-wrap min-h-[3.5rem] flex items-start">
        {text || (
          <span className="text-slate-400 italic">
            Waiting for generation...
          </span>
        )}
      </div>
      <button
        onClick={handleCopy}
        disabled={!text}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check size={20} className="text-emerald-500" />
        ) : (
          <ClipboardCopy size={20} />
        )}
      </button>
    </div>
  );
};

export default CopyArea;
