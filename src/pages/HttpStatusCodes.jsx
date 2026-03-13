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
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          HTTP Status Codes
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Quick reference for common HTTP status codes.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code (e.g. 404) or keyword (e.g. Not Found)"
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
        />

        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span
                className={`w-16 text-center font-bold text-lg ${
                  c.code >= 200 && c.code < 300
                    ? "text-emerald-600"
                    : c.code >= 300 && c.code < 400
                      ? "text-amber-600"
                      : c.code >= 400
                        ? "text-red-600"
                        : "text-slate-600"
                }`}
              >
                {c.code}
              </span>
              <div className="flex-1">
                <div className="font-semibold dark:text-slate-100">
                  {c.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No matching status codes.
          </div>
        )}
      </div>
    </div>
  );
}
