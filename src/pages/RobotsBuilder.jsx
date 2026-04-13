import { useMemo, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

const emptyGroup = () => ({
  userAgent: "*",
  allow: [""],
  disallow: [""],
  crawlDelay: "",
});

export default function RobotsBuilder({ onToast }) {
  const [groups, setGroups] = useState([emptyGroup()]);
  const [sitemaps, setSitemaps] = useState("https://example.com/sitemap.xml");

  const updateGroup = (gi, field, val) => {
    setGroups((gs) => {
      const next = [...gs];
      next[gi] = { ...next[gi], [field]: val };
      return next;
    });
  };

  const updateRuleLine = (gi, field, li, val) => {
    setGroups((gs) => {
      const next = [...gs];
      const g = { ...next[gi] };
      const arr = [...g[field]];
      arr[li] = val;
      g[field] = arr;
      next[gi] = g;
      return next;
    });
  };

  const addRule = (gi, field) => {
    setGroups((gs) => {
      const next = [...gs];
      const g = { ...next[gi] };
      g[field] = [...g[field], ""];
      next[gi] = g;
      return next;
    });
  };

  const removeRule = (gi, field, li) => {
    setGroups((gs) => {
      const next = [...gs];
      const g = { ...next[gi] };
      g[field] = g[field].filter((_, i) => i !== li);
      if (!g[field].length) g[field] = [""];
      next[gi] = g;
      return next;
    });
  };

  const output = useMemo(() => {
    const lines = [];
    for (const g of groups) {
      const ua = g.userAgent.trim() || "*";
      lines.push(`User-agent: ${ua}`);
      for (const a of g.allow) {
        const t = a.trim();
        if (t) lines.push(`Allow: ${t}`);
      }
      for (const d of g.disallow) {
        const t = d.trim();
        if (t) lines.push(`Disallow: ${t}`);
      }
      const cd = g.crawlDelay.trim();
      if (cd) lines.push(`Crawl-delay: ${cd}`);
      lines.push("");
    }
    for (const line of sitemaps.split("\n")) {
      const u = line.trim();
      if (u) lines.push(`Sitemap: ${u}`);
    }
    return lines.join("\n").trim() + "\n";
  }, [groups, sitemaps]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          robots.txt
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Build User-agent groups and Sitemap lines; copy the file body.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-8">
        {groups.map((g, gi) => (
          <div
            key={gi}
            className="p-4 border border-stone-200 dark:border-stone-700 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-stone-500">
                Group {gi + 1}
              </span>
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setGroups((gs) => gs.filter((_, i) => i !== gi))
                  }
                  className="text-[11px] font-mono underline text-red-600 dark:text-red-400"
                >
                  Remove group
                </button>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 mb-1">
                User-agent
              </label>
              <input
                value={g.userAgent}
                onChange={(e) => updateGroup(gi, "userAgent", e.target.value)}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
            {(["allow", "disallow"]).map((field) => (
              <div key={field}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-mono text-stone-500 capitalize">
                    {field}
                  </label>
                  <button
                    type="button"
                    onClick={() => addRule(gi, field)}
                    className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
                  >
                    + line
                  </button>
                </div>
                <div className="space-y-1">
                  {g[field].map((line, li) => (
                    <div key={li} className="flex gap-1">
                      <input
                        value={line}
                        onChange={(e) =>
                          updateRuleLine(gi, field, li, e.target.value)
                        }
                        placeholder={field === "allow" ? "/" : "/admin/"}
                        className="flex-1 p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(gi, field, li)}
                        className="px-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-mono text-stone-500 mb-1">
                Crawl-delay (optional)
              </label>
              <input
                value={g.crawlDelay}
                onChange={(e) => updateGroup(gi, "crawlDelay", e.target.value)}
                placeholder="10"
                className="w-full max-w-[8rem] p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setGroups((g) => [...g, emptyGroup()])}
          className="px-4 py-2 font-mono text-xs border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          + User-agent group
        </button>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
            Sitemap URLs (one per line)
          </label>
          <textarea
            value={sitemaps}
            onChange={(e) => setSitemaps(e.target.value)}
            rows={3}
            className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
              robots.txt
            </span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(output, () => onToast("Copied!"))
              }
              className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs whitespace-pre-wrap text-stone-800 dark:text-stone-200 max-h-64 overflow-y-auto">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}
