import { useMemo, useState } from "react";

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
      setFetchErr(e.message || "fetch failed");
    } finally {
      setFetchBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          URL redirect inspector
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Paste <code className="text-stone-600 dark:text-stone-300">curl -IL</code>{" "}
          output for a full chain, or try in-browser fetch (often CORS-blocked).
        </p>
      </header>

      <div className="space-y-8">
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-3">
          <h3 className="text-sm font-mono text-stone-700 dark:text-stone-300">
            From curl -IL (recommended)
          </h3>
          <textarea
            value={curlPaste}
            onChange={(e) => setCurlPaste(e.target.value)}
            rows={10}
            placeholder={`HTTP/2 301 \nlocation: https://...\n\nHTTP/2 200 ...`}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          {hops.length > 0 && (
            <table className="w-full text-left text-xs font-mono border border-stone-200 dark:border-stone-700">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-500">
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
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{h.status}</td>
                    <td className="p-2 break-all text-stone-700 dark:text-stone-300">
                      {h.location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-3">
          <h3 className="text-sm font-mono text-stone-700 dark:text-stone-300">
            In-browser fetch (manual redirects)
          </h3>
          <p className="text-xs font-mono text-stone-500">
            Works only when the browser can read status and{" "}
            <code className="text-stone-600 dark:text-stone-300">Location</code>{" "}
            (rare for third-party shorteners).
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
            <button
              type="button"
              onClick={runFetch}
              disabled={fetchBusy}
              className="px-4 py-3 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 disabled:opacity-50"
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
            <ul className="text-xs font-mono space-y-2 border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-950 max-h-64 overflow-y-auto">
              {fetchLog.map((h, i) => (
                <li key={i} className="space-y-0.5">
                  <div className="text-stone-500">Hop {i + 1}</div>
                  <div className="break-all">{h.url}</div>
                  <div>status {h.status}</div>
                  {h.location && (
                    <div className="break-all text-stone-600 dark:text-stone-400">
                      → {h.location}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
