import { useMemo, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

/**
 * Very small curl-ish parser: flags and a single URL token.
 */
function parseCurl(line) {
  const warnings = [];
  const tokens = line.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  if (!tokens.length || !/^curl$/i.test(tokens[0].replace(/^['"]|['"]$/g, ""))) {
    return { error: "Start with curl …", method: "GET", url: "", headers: {}, body: null };
  }

  let method = "GET";
  let url = "";
  const headers = {};
  let body = null;
  let i = 1;

  while (i < tokens.length) {
    const t = tokens[i].replace(/^['"]|['"]$/g, "");
    const next = tokens[i + 1]?.replace(/^['"]|['"]$/g, "") ?? "";

    if (t === "-X" || t === "--request") {
      method = (next || "GET").toUpperCase();
      i += 2;
      continue;
    }
    if (t === "-H" || t === "--header") {
      const m = next.match(/^([^:]+):\s*(.*)$/);
      if (m) headers[m[1].trim()] = m[2].trim();
      i += 2;
      continue;
    }
    if (
      t === "-d" ||
      t === "--data" ||
      t === "--data-ascii" ||
      t === "--data-binary" ||
      t === "--data-raw"
    ) {
      if (t.includes("binary")) warnings.push("Body treated as string (binary not preserved).");
      body = next;
      if (method === "GET") method = "POST";
      i += 2;
      continue;
    }
    if (t === "--json") {
      body = next;
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      if (method === "GET") method = "POST";
      i += 2;
      continue;
    }
    if (t === "-b" || t === "--cookie") {
      warnings.push("Cookies not translated; add a Cookie header manually.");
      i += 2;
      continue;
    }
    if (t.startsWith("-")) {
      warnings.push(`Ignored flag: ${t}`);
      i += 1;
      continue;
    }
    if (/^https?:\/\//i.test(t)) {
      url = t;
      i += 1;
      continue;
    }
    i += 1;
  }

  return { error: null, method, url, headers, body, warnings };
}

function buildFetch({ method, url, headers, body }) {
  const hdr = { ...headers };
  const lines = [`const res = await fetch(${JSON.stringify(url)}, {`];
  lines.push(`  method: ${JSON.stringify(method)},`);
  if (Object.keys(hdr).length || body != null) {
    lines.push(`  headers: {`);
    for (const [k, v] of Object.entries(hdr)) {
      lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    }
    lines.push(`  },`);
  }
  if (body != null) {
    lines.push(`  body: ${JSON.stringify(body)},`);
  }
  lines.push(`});`);
  lines.push(`const data = await res.text();`);
  return lines.join("\n");
}

function buildAxios({ method, url, headers, body }) {
  const opts = [`method: ${JSON.stringify(method)}`, `url: ${JSON.stringify(url)}`];
  if (Object.keys(headers).length) {
    opts.push(`headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}`);
  }
  if (body != null) {
    const ct = headers["Content-Type"] || headers["content-type"];
    if (ct?.includes("json")) {
      try {
        opts.push(`data: ${JSON.stringify(JSON.parse(body))}`);
      } catch {
        opts.push(`data: ${JSON.stringify(body)}`);
      }
    } else {
      opts.push(`data: ${JSON.stringify(body)}`);
    }
  }
  return `const res = await axios({\n  ${opts.join(",\n  ")}\n});\nconst data = res.data;`;
}

export default function CurlConverter({ onToast }) {
  const [input, setInput] = useState(
    `curl -X POST https://api.example.com/v1/items -H "Authorization: Bearer token" -H "Content-Type: application/json" --data '{"name":"test"}'`,
  );

  const parsed = useMemo(() => parseCurl(input.trim()), [input]);
  const fetchCode = useMemo(
    () =>
      parsed.url
        ? buildFetch(parsed)
        : "// Need a URL in the curl command",
    [parsed],
  );
  const axiosCode = useMemo(
    () =>
      parsed.url
        ? buildAxios(parsed)
        : "// Need a URL in the curl command",
    [parsed],
  );

  const copy = (text) =>
    copyToClipboard(text, () => onToast("Copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          cURL → fetch / axios
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Heuristic converter for common flags. Multipart, cookies, and exotic
          options are skipped with a warning.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />

        {parsed.error && (
          <p className="text-sm text-amber-700 dark:text-amber-400 font-mono">
            {parsed.error}
          </p>
        )}
        {parsed.warnings?.length > 0 && (
          <ul className="text-xs font-mono text-stone-600 dark:text-stone-400 list-disc pl-5">
            {parsed.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}

        {[
          { title: "fetch", code: fetchCode },
          { title: "axios", code: `import axios from "axios";\n\n${axiosCode}` },
        ].map((b) => (
          <div key={b.title}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
                {b.title}
              </span>
              <button
                type="button"
                onClick={() => copy(b.code)}
                className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs whitespace-pre-wrap text-stone-800 dark:text-stone-200 max-h-56 overflow-y-auto">
              {b.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
