import { useState, useMemo } from "react";

const HTTP_CODES = [
  { code: 200, name: "OK", desc: "Request succeeded" },
  { code: 201, name: "Created", desc: "Resource created" },
  { code: 204, name: "No Content", desc: "Success, no body" },
  { code: 301, name: "Moved Permanently", desc: "Redirect permanent" },
  { code: 302, name: "Found", desc: "Redirect temporary" },
  { code: 304, name: "Not Modified", desc: "Use cached version" },
  { code: 400, name: "Bad Request", desc: "Invalid request" },
  { code: 401, name: "Unauthorized", desc: "Authentication required" },
  { code: 403, name: "Forbidden", desc: "Access denied" },
  { code: 404, name: "Not Found", desc: "Resource not found" },
  { code: 405, name: "Method Not Allowed", desc: "HTTP method not allowed" },
  { code: 408, name: "Request Timeout", desc: "Server timed out" },
  { code: 409, name: "Conflict", desc: "State conflict" },
  { code: 422, name: "Unprocessable Entity", desc: "Validation failed" },
  { code: 429, name: "Too Many Requests", desc: "Rate limited" },
  { code: 500, name: "Internal Server Error", desc: "Server error" },
  { code: 502, name: "Bad Gateway", desc: "Invalid upstream response" },
  { code: 503, name: "Service Unavailable", desc: "Temporarily unavailable" },
];

export default function HttpStatusCodes() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return HTTP_CODES;
    return HTTP_CODES.filter(
      (c) =>
        c.code.toString().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          HTTP Status Codes
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Quick reference for common HTTP status codes.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="> search by code (e.g. 404) or keyword (e.g. Not Found)"
          className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
        />

        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-4 p-4 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              <span
                className={`w-16 text-center font-mono font-bold text-lg ${
                  c.code >= 200 && c.code < 300
                    ? "text-emerald-600 dark:text-emerald-400"
                    : c.code >= 300 && c.code < 400
                      ? "text-amber-600 dark:text-amber-400"
                      : c.code >= 400
                        ? "text-red-600 dark:text-red-400"
                        : "text-stone-600 dark:text-stone-400"
                }`}
              >
                {c.code}
              </span>
              <div className="flex-1">
                <div className="font-mono font-semibold text-stone-800 dark:text-stone-100">
                  {c.name}
                </div>
                <div className="text-sm font-mono text-stone-500 dark:text-stone-400">
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 font-mono text-stone-500 text-sm">
            No matching status codes.
          </div>
        )}
      </div>
    </div>
  );
}
