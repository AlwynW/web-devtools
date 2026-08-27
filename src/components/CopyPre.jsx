import CopyButton from "./CopyButton";

export default function CopyPre({
  text,
  children,
  onCopySuccess,
  className = "max-h-64 overflow-y-auto overflow-x-auto border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950",
  preClassName = "px-4 pb-4 pt-0 font-mono text-stone-800 dark:text-stone-200 whitespace-pre-wrap break-all",
  title = "Copy to clipboard",
}) {
  const content = children ?? text;
  const copyText = text ?? (typeof children === "string" ? children : "");

  return (
    <div className={`relative ${className}`}>
      <div className="sticky top-0 z-10 h-0 overflow-visible pointer-events-none">
        <div className="absolute top-2 right-2">
          <CopyButton
            text={copyText}
            onCopySuccess={onCopySuccess}
            title={title}
            disabled={!copyText}
            className="pointer-events-auto shadow-sm"
          />
        </div>
      </div>
      <pre className={preClassName}>{content}</pre>
    </div>
  );
}
