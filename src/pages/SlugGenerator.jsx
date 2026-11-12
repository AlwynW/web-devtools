import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import Input, { Textarea } from "../components/ui/Input";
import SegmentedControl from "../components/ui/SegmentedControl";

const DEFAULT_REPLACEMENTS = [
  { from: "&", to: "and" },
  { from: "@", to: "at" },
  { from: "+", to: "plus" },
];

function slugify(text, options) {
  if (!text?.trim()) return "";
  let slug = text.trim();

  const { separator, lowercase, maxLength, stripSpecialChars, customReplacements, preserveUnicode } = options;

  for (const { from, to } of customReplacements) {
    if (from && to) {
      slug = slug.split(from).join(to);
    }
  }

  if (!preserveUnicode) {
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (stripSpecialChars) {
    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, " ");
  }

  slug = slug.replace(/\s+/g, separator);
  slug = slug.replace(new RegExp(`\\${separator}+`, "g"), separator);
  slug = slug.replace(new RegExp(`^\\${separator}|\\${separator}$`, "g"), "");

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (maxLength && maxLength > 0) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`\\${separator}[^\\${separator}]*$`), "");
  }

  return slug;
}

export default function SlugGenerator({ onToast }) {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState("");
  const [stripSpecialChars, setStripSpecialChars] = useState(true);
  const [preserveUnicode, setPreserveUnicode] = useState(false);
  const [customReplacements, setCustomReplacements] = useState(DEFAULT_REPLACEMENTS);

  const output = useMemo(
    () =>
      slugify(input, {
        separator,
        lowercase,
        maxLength: maxLength ? parseInt(maxLength, 10) : 0,
        stripSpecialChars,
        customReplacements,
        preserveUnicode,
      }),
    [input, separator, lowercase, maxLength, stripSpecialChars, customReplacements, preserveUnicode]
  );

  const updateReplacement = (index, field, value) => {
    setCustomReplacements((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addReplacement = () => {
    setCustomReplacements((prev) => [...prev, { from: "", to: "" }]);
  };

  const removeReplacement = (index) => {
    setCustomReplacements((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Slug Generator" description="Convert text to URL-friendly slugs with full options." />

      <Panel className="space-y-6">
        <div>
          <Label>
            Input text
          </Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hello World! This is a title."
            className="h-24"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>
              Separator
            </Label>
            <SegmentedControl
              aria-label="Separator"
              value={separator}
              onChange={setSeparator}
              options={[
                { value: "-", label: "hyphen" },
                { value: "_", label: "underscore" },
              ]}
            />
          </div>
          <div>
            <Label>
              Max length
            </Label>
            <Input
              type="number"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              placeholder="No limit"
              min="1"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="border-border-muted focus:ring-focus"
            />
            <span className="text-sm font-mono text-fg-muted">Lowercase</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stripSpecialChars}
              onChange={(e) => setStripSpecialChars(e.target.checked)}
              className="border-border-muted focus:ring-focus"
            />
            <span className="text-sm font-mono text-fg-muted">Strip special chars</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveUnicode}
              onChange={(e) => setPreserveUnicode(e.target.checked)}
              className="border-border-muted focus:ring-focus"
            />
            <span className="text-sm font-mono text-fg-muted">Preserve unicode</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>
              Custom replacements
            </Label>
            <button
              onClick={addReplacement}
              className="text-xs font-mono text-fg-muted hover:text-fg"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {customReplacements.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={r.from}
                  onChange={(e) => updateReplacement(i, "from", e.target.value)}
                  placeholder="from"
                  className="flex-1 p-2 bg-surface border border-border-strong rounded-control font-mono text-sm"
                />
                <span className="text-fg-subtle">→</span>
                <input
                  type="text"
                  value={r.to}
                  onChange={(e) => updateReplacement(i, "to", e.target.value)}
                  placeholder="to"
                  className="flex-1 p-2 bg-surface border border-border-strong rounded-control font-mono text-sm"
                />
                <button
                  onClick={() => removeReplacement(i)}
                  className="p-2 text-fg-muted hover:text-red-600"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {output && (
          <>
            <Label>
              Output slug
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
