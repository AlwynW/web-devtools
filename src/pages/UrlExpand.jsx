import { useMemo, useState } from "react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

function parseCurlTrace(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const hops = [];
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    const http = line.match(/^HTTP\/[\d.]+\s+(\d+)/i);
    if (http) {
      if (current) hops.push(current);
      current = { status: http[1], location: null, line: raw };
      continue;
    }
    const loc = line.match(/^location:\s*(.+)$/i);
    if (loc && current) {
      current.location = loc[1].trim();
    }
  }
  if (current) hops.push(current);
  return hops;
}

export default function UrlExpand() {
  const online = useOnlineStatus();
  const [curlPaste, setCurlPaste] = useState("");
  const [url, setUrl] = useState("https://example.com");
  const [fetchLog, setFetchLog] = useState([]);
  const [fetchBusy, setFetchBusy] = useState(false);
  const [fetchErr, setFetchErr] = useState(null);

  const hops = useMemo(
    () => (curlPaste.trim() ? parseCurlTrace(curlPaste) : []),
    [curlPaste],
  );

  const runFetch = async () => {
    if (!navigator.onLine) {
      setFetchErr("Needs network for live fetch. Paste curl -IL output instead.");
      return;
    }
    setFetchBusy(true);
    setFetchErr(null);
    setFetchLog([]);
    const chain = [];
    let next = url.trim();
    if (!next) {
      setFetchBusy(false);
      return;
    }
    const max = 12;
    try {
      for (let i = 0; i < max; i++) {
        const res = await fetch(next, {
          method: "GET",
          redirect: "manual",
          mode: "cors",
        });
        const status = res.status;
        const loc = res.headers.get("Location");
        chain.push({ url: next, status, location: loc });
        if (status >= 300 && status < 400 && loc) {
          next = new URL(loc, next).href;
          continue;
        }
        break;
      }
      setFetchLog(chain);
      if (!chain.length) {
        setFetchErr("No response (blocked or invalid URL).");
      } else if (
        chain.length === 1 &&
        chain[0].status === 0 &&
        !chain[0].location
      ) {
        setFetchErr(
          "Opaque or blocked response (typical for cross-origin short links). Paste curl -IL output instead.",
        );
      }
    } catch (e) {
      setFetchErr(
        !navigator.onLine
          ? "Needs network for live fetch. Paste curl -IL output instead."
          : e.message || "fetch failed",
      );
    } finally {
      setFetchBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="URL redirect inspector" description={<>Paste <code className="text-fg-muted">curl -IL</code>{" "}
          output for a full chain, or try in-browser fetch (often CORS-blocked).</>} />

      <div className="space-y-8">
        <Panel className="space-y-3">
          <h3 className="text-sm font-mono text-fg-soft">
            From curl -IL (recommended)
          </h3>
          <textarea
            value={curlPaste}
            onChange={(e) => setCurlPaste(e.target.value)}
            rows={10}
            placeholder={`HTTP/2 301 \nlocation: https://...\n\nHTTP/2 200 ...`}
            className="w-full p-4 border border-border-strong font-mono text-xs bg-surface text-fg"
          />
          {hops.length > 0 && (
            <table className="w-full text-left text-xs font-mono border border-border">
              <thead className="bg-hover-muted text-fg-muted">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {hops.map((h, i) => (
                  <tr
                    key={i}
                    className="border-t border-border"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{h.status}</td>
                    <td className="p-2 break-all text-fg-soft">
                      {h.location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel className="space-y-3">
          <h3 className="text-sm font-mono text-fg-soft">
            In-browser fetch (manual redirects)
          </h3>
          <p className="text-xs font-mono text-fg-muted">
            Works only when the browser can read status and{" "}
            <code className="text-fg-muted">Location</code>{" "}
            (rare for third-party shorteners).
          </p>
          {!online && (
            <p className="text-xs font-mono text-amber-800 dark:text-amber-300">
              Offline — live fetch needs network. Paste curl -IL output above.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={!online}
              className="flex-1 p-3 border border-border-strong font-mono text-sm bg-surface text-fg disabled:opacity-50"
            />
            <button
              type="button"
              onClick={runFetch}
              disabled={fetchBusy || !online}
              className="px-4 py-3 font-mono text-xs border border-inverse-border bg-inverse text-primary-fg disabled:opacity-50"
            >
              {fetchBusy ? "…" : "Follow"}
            </button>
          </div>
          {fetchErr && (
            <p className="text-sm text-amber-800 dark:text-amber-300 font-mono">
              {fetchErr}
            </p>
          )}
          {fetchLog.length > 0 && (
            <ul className="text-xs font-mono space-y-2 border border-border p-3 bg-surface-code max-h-64 overflow-y-auto">
              {fetchLog.map((h, i) => (
                <li key={i} className="space-y-0.5">
                  <div className="text-fg-muted">Hop {i + 1}</div>
                  <div className="break-all">{h.url}</div>
                  <div>status {h.status}</div>
                  {h.location && (
                    <div className="break-all text-fg-muted">
                      → {h.location}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
