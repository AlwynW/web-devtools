import { useMemo, useState } from "react";
import CopyPre from "../components/CopyPre";
import Button from "../components/Button";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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
      <PageHeader title="robots.txt" description="Build User-agent groups and Sitemap lines; copy the file body." />

      <Panel className="space-y-8">
        {groups.map((g, gi) => (
          <div
            key={gi}
            className="p-4 border border-border rounded-control space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-fg-muted">
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
              <label className="field-label mb-1">
                User-agent
              </label>
              <input
                value={g.userAgent}
                onChange={(e) => updateGroup(gi, "userAgent", e.target.value)}
                className="w-full p-2 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
              />
            </div>
            {(["allow", "disallow"]).map((field) => (
              <div key={field}>
                <div className="flex justify-between items-center mb-1">
                  <label className="field-label">
                    {field}
                  </label>
                  <button
                    type="button"
                    onClick={() => addRule(gi, field)}
                    className="text-[11px] font-mono underline text-fg-muted"
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
                        className="flex-1 p-2 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(gi, field, li)}
                        className="px-2 text-fg-muted hover:text-fg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="field-label mb-1">
                Crawl-delay (optional)
              </label>
              <input
                value={g.crawlDelay}
                onChange={(e) => updateGroup(gi, "crawlDelay", e.target.value)}
                placeholder="10"
                className="w-full max-w-[8rem] p-2 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
              />
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={() => setGroups((g) => [...g, emptyGroup()])}
          className="w-fit"
        >
          + User-agent group
        </Button>

        <div>
          <label className="field-label mb-2">
            Sitemap URLs (one per line)
          </label>
          <textarea
            value={sitemaps}
            onChange={(e) => setSitemaps(e.target.value)}
            rows={3}
            className="w-full p-3 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
          />
        </div>

        <div>
          <span className="field-label mb-2">
            robots.txt
          </span>
          <CopyPre
            text={output}
            onCopySuccess={() => onToast("Copied!")}
            className="border border-border rounded-control bg-surface-code max-h-64 overflow-y-auto"
            preClassName="p-4 font-mono text-xs whitespace-pre-wrap text-fg-soft"
          />
        </div>
      </Panel>
    </div>
  );
}
