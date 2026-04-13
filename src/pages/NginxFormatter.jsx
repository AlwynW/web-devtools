import { useMemo, useState } from "react";
import { formatNginxConfig, lintNginxConfig } from "../utils/nginxFormat";
import { copyToClipboard } from "../utils/clipboard";

const SAMPLE = `server {
listen 80;
server_name example.com;
location / {
proxy_pass http://127.0.0.1:3000;
}
}
`;

export default function NginxFormatter({ onToast }) {
  const [input, setInput] = useState(SAMPLE);

  const formatted = useMemo(() => {
    try {
      return formatNginxConfig(input);
    } catch {
      return input;
    }
  }, [input]);

  const issues = useMemo(() => lintNginxConfig(input), [input]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Nginx formatter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Brace-aware indent; light lint for braces and duplicate{" "}
          <code className="text-stone-600 dark:text-stone-300">server_name</code>.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={16}
              className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
                Formatted
              </label>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(formatted, () => onToast("Copied!"))
                }
                className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={formatted}
              rows={16}
              className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInput(formatted)}
          className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
        >
          Replace input with formatted
        </button>

        {issues.length > 0 && (
          <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 space-y-1">
            <p className="text-xs font-mono font-semibold text-amber-900 dark:text-amber-200">
              Lint
            </p>
            <ul className="text-xs font-mono text-amber-900 dark:text-amber-200 space-y-1">
              {issues.map((it, i) => (
                <li key={i}>
                  Line {it.line}: {it.msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
