import { useMemo, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

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

  const copy = (text) =>
    copyToClipboard(text, () => onToast("Copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Redirect rules
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Snippets for Netlify, Vercel, nginx, Apache httpd.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4 font-mono text-sm">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-[11px] text-stone-500 mb-1">Path</label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-[11px] text-stone-500 mb-1">
              Target URL or path
            </label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Code</label>
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
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
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-stone-500 uppercase tracking-[0.18em]">
                {sec.title}
              </span>
              <button
                type="button"
                onClick={() => copy(sec.body)}
                className="text-[11px] underline text-stone-600 dark:text-stone-400"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-xs whitespace-pre-wrap break-all text-stone-800 dark:text-stone-200">
              {sec.body}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
