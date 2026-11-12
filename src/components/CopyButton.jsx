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
      className={`p-2 border border-border-strong rounded-button bg-surface hover:bg-hover text-fg-muted hover:text-fg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? (
        <Check size={size} weight="thin" className="text-success" />
      ) : (
        <ClipboardText size={size} weight="thin" />
      )}
    </button>
  );
}
