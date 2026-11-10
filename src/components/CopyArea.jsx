import CopyButton from "./CopyButton";

const CopyArea = ({ text, onCopySuccess }) => {
  return (
    <div className="relative group mt-4">
      <div className="w-full bg-surface-muted border border-border-strong rounded-control p-4 pr-16 text-sm font-mono text-fg break-words whitespace-pre-wrap min-h-[3.5rem] flex items-start">
        {text || (
          <span className="text-fg-subtle italic">Waiting for generation...</span>
        )}
      </div>
      <CopyButton
        text={text}
        onCopySuccess={onCopySuccess}
        className="absolute right-2 top-2"
      />
    </div>
  );
};

export default CopyArea;
