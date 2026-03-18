import { useState, useMemo, useEffect } from "react";
import CopyArea from "../components/CopyArea";

export default function UrlParser({ onToast }) {
  const [input, setInput] = useState("");
  const [params, setParams] = useState([]);
  const [error, setError] = useState(null);

  const parsed = useMemo(() => {
    setError(null);
    if (!input.trim()) return null;
    try {
      const url = new URL(input.startsWith("http") ? input : "https://" + input);
      const paramList = [];
      url.searchParams.forEach((value, key) => {
        paramList.push({ key, value });
      });
      return {
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port || "",
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        paramList,
      };
    } catch (e) {
      setError(e.message || "Invalid URL");
      return null;
    }
  }, [input]);

  useEffect(() => {
    if (parsed?.paramList) setParams(parsed.paramList);
  }, [input]);

  const updateParam = (index, field, value) => {
    setParams((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addParam = () => {
    setParams((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeParam = (index) => {
    setParams((prev) => prev.filter((_, i) => i !== index));
  };

  const rebuiltUrl = useMemo(() => {
    if (!parsed) return "";
    try {
      const url = new URL(input.startsWith("http") ? input : "https://" + input);
      url.search = "";
      params.forEach(({ key, value }) => {
        if (key.trim()) url.searchParams.set(key.trim(), value);
      });
      return url.toString();
    } catch {
      return "";
    }
  }, [input, parsed, params]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          URL Parser / Query Builder
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Parse URLs and edit query parameters.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            URL
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?foo=bar&baz=qux"
            className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        {parsed && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Protocol", value: parsed.protocol },
                { label: "Host", value: parsed.host },
                { label: "Path", value: parsed.pathname },
                { label: "Hash", value: parsed.hash || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    {label}
                  </div>
                  <div className="font-mono text-sm text-stone-800 dark:text-stone-200 truncate">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                  Query parameters
                </label>
                <button
                  onClick={addParam}
                  className="text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {params.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={p.key}
                      onChange={(e) => updateParam(i, "key", e.target.value)}
                      placeholder="key"
                      className="flex-1 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm"
                    />
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => updateParam(i, "value", e.target.value)}
                      placeholder="value"
                      className="flex-1 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm"
                    />
                    <button
                      onClick={() => removeParam(i)}
                      className="p-2 text-stone-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {rebuiltUrl && (
              <>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                  Rebuilt URL
                </label>
                <CopyArea text={rebuiltUrl} onCopySuccess={() => onToast("Copied!")} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
