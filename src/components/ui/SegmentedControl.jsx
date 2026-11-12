export default function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap gap-1 p-1 bg-surface-sunken border border-border-strong w-max button-text-sm rounded-button ${className}`}
    >
      {options.map((opt) => {
        const id = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={selected}
            className={`px-3 py-1.5 transition-colors rounded-button ${
              selected
                ? "bg-primary text-primary-fg"
                : "text-fg-muted hover:bg-hover-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
