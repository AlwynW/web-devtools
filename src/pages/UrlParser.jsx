import { useState, useMemo, useEffect } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

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
      <PageHeader title="URL Parser / Query Builder" description="Parse URLs and edit query parameters." />

      <Panel className="space-y-6">
        <div>
          <Label>
            URL
          </Label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?foo=bar&baz=qux"
            className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {error && (
          <ErrorBanner className="p-4 font-mono text-sm">
            {error}
          </ErrorBanner>
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
                  <div className="field-label">
                    {label}
                  </div>
                  <div className="font-mono text-sm text-fg-soft truncate">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>
                  Query parameters
                </Label>
                <button
                  onClick={addParam}
                  className="text-xs font-mono text-fg-muted hover:text-fg"
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
                      className="flex-1 p-2 bg-surface border border-border-strong rounded-control font-mono text-sm"
                    />
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => updateParam(i, "value", e.target.value)}
                      placeholder="value"
                      className="flex-1 p-2 bg-surface border border-border-strong rounded-control font-mono text-sm"
                    />
                    <button
                      onClick={() => removeParam(i)}
                      className="p-2 text-fg-muted hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {rebuiltUrl && (
              <>
                <Label>
                  Rebuilt URL
                </Label>
                <CopyArea text={rebuiltUrl} onCopySuccess={() => onToast("Copied!")} />
              </>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
