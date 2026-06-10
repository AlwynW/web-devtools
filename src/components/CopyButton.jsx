import { useState } from "react";
import { ClipboardText, Check } from "phosphor-react";
import { copyToClipboard } from "../utils/clipboard";

export default function CopyButton({
  text,
  onCopySuccess,
  title = "Copy to clipboard",
  className = "",
  size = 18,
  disabled,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text || disabled) return;
    copyToClipboard(text, () => {
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      title={title}
      aria-label={title}
      className={`p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? (
        <Check size={size} weight="thin" className="text-emerald-500" />
      ) : (
        <ClipboardText size={size} weight="thin" />
      )}
    </button>
  );
}
