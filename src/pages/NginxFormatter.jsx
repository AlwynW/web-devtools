import { useMemo, useState } from "react";
import { formatNginxConfig, lintNginxConfig } from "../utils/nginxFormat";
import CopyButton from "../components/CopyButton";
import Button from "../components/Button";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

const SAMPLE = `server {
listen 80;
server_name example.com;
location / {
proxy_pass http://127.0.0.1:3000;
}
}
`;

export default function NginxFormatter({ onToast }) {
  const [input, setInput] = useState(SAMPLE);

  const formatted = useMemo(() => {
    try {
      return formatNginxConfig(input);
    } catch {
      return input;
    }
  }, [input]);

  const issues = useMemo(() => lintNginxConfig(input), [input]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Nginx formatter" description={<>Brace-aware indent; light lint for braces and duplicate{" "}
          <code className="text-fg-muted">server_name</code>.</>} />

      <Panel className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="field-label mb-2">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={16}
              className="w-full p-4 border border-border-strong rounded-control font-mono text-xs bg-surface text-fg"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="field-label">
                Formatted
              </label>
              <CopyButton
                text={formatted}
                onCopySuccess={() => onToast("Copied!")}
                size={16}
              />
            </div>
            <textarea
              readOnly
              value={formatted}
              rows={16}
              className="w-full p-4 border border-border-strong rounded-control font-mono text-xs bg-surface-code text-fg-soft"
            />
          </div>
        </div>

        <Button onClick={() => setInput(formatted)} className="w-fit">
          Replace input with formatted
        </Button>

        {issues.length > 0 && (
          <div className="p-4 border border-warning-border bg-warning-bg space-y-1 rounded-control">
            <p className="text-xs font-mono font-semibold text-warning-fg">
              Lint
            </p>
            <ul className="text-xs font-mono text-warning-fg space-y-1">
              {issues.map((it, i) => (
                <li key={i}>
                  Line {it.line}: {it.msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </div>
  );
}
