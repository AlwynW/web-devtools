import { useState } from "react";
import { ClipboardText, Check } from "phosphor-react";
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
      <div className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 p-4 pr-16 text-sm font-mono text-stone-800 dark:text-stone-100 break-words whitespace-pre-wrap min-h-[3.5rem] flex items-start">
        {text || (
          <span className="text-stone-400 italic">
            Waiting for generation...
          </span>
        )}
      </div>
      <button
        onClick={handleCopy}
        disabled={!text}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check size={18} weight="thin" className="text-emerald-500" />
        ) : (
          <ClipboardText size={18} weight="thin" />
        )}
      </button>
    </div>
  );
};

export default CopyArea;
