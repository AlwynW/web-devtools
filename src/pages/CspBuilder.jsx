import { useMemo, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

const DIRECTIVES = [
  { key: "defaultSrc", name: "default-src", placeholder: "'self'" },
  { key: "scriptSrc", name: "script-src", placeholder: "'self'" },
  { key: "styleSrc", name: "style-src", placeholder: "'self'" },
  { key: "imgSrc", name: "img-src", placeholder: "'self' data:" },
  { key: "fontSrc", name: "font-src", placeholder: "'self'" },
  { key: "connectSrc", name: "connect-src", placeholder: "'self'" },
  { key: "frameSrc", name: "frame-src", placeholder: "'none'" },
  { key: "objectSrc", name: "object-src", placeholder: "'none'" },
  { key: "baseUri", name: "base-uri", placeholder: "'self'" },
  { key: "formAction", name: "form-action", placeholder: "'self'" },
  { key: "frameAncestors", name: "frame-ancestors", placeholder: "'none'" },
];

export default function CspBuilder({ onToast }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(DIRECTIVES.map((d) => [d.key, ""])),
  );
  const [upgradeInsecure, setUpgradeInsecure] = useState(false);
  const [blockAllMixed, setBlockAllMixed] = useState(false);

  const headerValue = useMemo(() => {
    const parts = [];
    for (const d of DIRECTIVES) {
      const v = values[d.key]?.trim();
      if (v) parts.push(`${d.name} ${v}`);
    }
    if (upgradeInsecure) parts.push("upgrade-insecure-requests");
    if (blockAllMixed) parts.push("block-all-mixed-content");
    return parts.join("; ");
  }, [values, upgradeInsecure, blockAllMixed]);

  const metaTag = useMemo(
    () =>
      headerValue
        ? `<meta http-equiv="Content-Security-Policy" content="${headerValue.replace(/"/g, "&quot;")}">`
        : "",
    [headerValue],
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          CSP builder
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Build a Content-Security-Policy header or meta tag. Empty fields are
          omitted.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="space-y-3">
          {DIRECTIVES.map((d) => (
            <div key={d.key}>
              <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.15em] mb-1">
                {d.name}
              </label>
              <input
                value={values[d.key]}
                onChange={(e) =>
                  setValues((s) => ({ ...s, [d.key]: e.target.value }))
                }
                placeholder={d.placeholder}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 font-mono text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={upgradeInsecure}
              onChange={(e) => setUpgradeInsecure(e.target.checked)}
            />
            upgrade-insecure-requests
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={blockAllMixed}
              onChange={(e) => setBlockAllMixed(e.target.checked)}
            />
            block-all-mixed-content
          </label>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
              Header value
            </span>
            <button
              type="button"
              onClick={() =>
                headerValue &&
                copyToClipboard(headerValue, () => onToast("Copied!"))
              }
              className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs break-all text-stone-800 dark:text-stone-200 min-h-[3rem]">
            {headerValue || "—"}
          </pre>
        </div>

        {metaTag && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
                Meta tag
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(metaTag, () => onToast("Copied!"))
                }
                className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs break-all text-stone-800 dark:text-stone-200">
              {metaTag}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
