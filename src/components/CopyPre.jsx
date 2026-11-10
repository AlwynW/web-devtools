import CopyButton from "./CopyButton";

export default function CopyPre({
  text,
  children,
  onCopySuccess,
  className = "max-h-64 overflow-y-auto overflow-x-auto border border-border rounded-control bg-surface-code",
  preClassName = "px-4 pb-4 pt-0 font-mono text-fg whitespace-pre-wrap break-all",
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
