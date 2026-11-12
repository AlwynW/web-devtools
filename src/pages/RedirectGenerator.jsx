import { useMemo, useState } from "react";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

export default function RedirectGenerator({ onToast }) {
  const [path, setPath] = useState("/old");
  const [target, setTarget] = useState("/new");
  const [code, setCode] = useState("301");

  const blocks = useMemo(() => {
    const p = path.startsWith("/") ? path : `/${path}`;
    const t = target.startsWith("http") ? target : target;
    const c = parseInt(code, 10) || 301;
    const netlify = `${p} ${t} ${c}`;
    const vercel = JSON.stringify(
      [{ source: p, destination: t, permanent: c === 301 }],
      null,
      2,
    );
    const nginx =
      c === 301 || c === 302
        ? `return ${c} ${t};`
        : `return ${c} ${t};`;
    const nginxLoc = `location = ${p} {\n    ${nginx}\n}`;
    const apache = `Redirect ${c} ${p} ${t}`;
    return { netlify, vercel, nginxLoc, apache, p, t, c };
  }, [path, target, code]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Redirect rules" description="Snippets for Netlify, Vercel, nginx, Apache httpd." />

      <Panel className="space-y-4 font-mono text-sm">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="field-label mb-1">Path</label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full p-3 border border-border-strong rounded-control bg-surface text-fg"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="field-label mb-1">
              Target URL or path
            </label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-3 border border-border-strong rounded-control bg-surface text-fg"
            />
          </div>
          <div>
            <label className="field-label mb-1">Code</label>
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border border-border-strong rounded-control bg-surface text-fg"
            >
              <option value="301">301</option>
              <option value="302">302</option>
              <option value="307">307</option>
              <option value="308">308</option>
            </select>
          </div>
        </div>

        {[
          { title: "Netlify _redirects", body: blocks.netlify },
          { title: "vercel.json redirects[]", body: blocks.vercel },
          { title: "nginx (location block)", body: blocks.nginxLoc },
          { title: "Apache mod_alias", body: blocks.apache },
        ].map((sec) => (
          <div key={sec.title}>
            <span className="field-label mb-2">
              {sec.title}
            </span>
            <CopyPre
              text={sec.body}
              onCopySuccess={() => onToast("Copied!")}
              className="border border-border rounded-control bg-surface-code"
              preClassName="p-3 text-xs whitespace-pre-wrap break-all text-fg-soft"
            />
          </div>
        ))}
      </Panel>
    </div>
  );
}
