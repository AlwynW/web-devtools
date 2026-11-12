import { useState, useRef, useEffect, useCallback } from "react";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

export default function KeycodeInspector({ onToast }) {
  const [last, setLast] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    boxRef.current?.focus();
  }, []);

  const onKeyDown = useCallback((e) => {
    setLast({
      key: e.key,
      code: e.code,
      which: e.which,
      location: e.location,
      repeat: e.repeat,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }, []);

  const json = last ? JSON.stringify(last, null, 2) : "";

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Key inspector" description={<>Focus the box and press keys. Uses <code className="text-fg-muted">keydown</code>{" "}
          (modifiers and legacy <code className="text-fg-muted">which</code>).</>} />

      <Panel className="space-y-4">
        <div
          ref={boxRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="min-h-[8rem] p-6 border-2 border-dashed border-border-muted rounded font-mono text-sm text-fg-muted outline-none focus:border-stone-900 dark:focus:border-stone-300 focus:ring-1 focus:ring-focus"
        >
          Click here, then type…
        </div>

        {last && (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-fg-soft">
              <dt className="text-fg-muted">key</dt>
              <dd>{JSON.stringify(last.key)}</dd>
              <dt className="text-fg-muted">code</dt>
              <dd>{last.code}</dd>
              <dt className="text-fg-muted">which</dt>
              <dd>{last.which}</dd>
              <dt className="text-fg-muted">location</dt>
              <dd>{last.location}</dd>
              <dt className="text-fg-muted">repeat</dt>
              <dd>{String(last.repeat)}</dd>
              <dt className="text-fg-muted">modifiers</dt>
              <dd>
                ctrl={String(last.ctrlKey)} shift={String(last.shiftKey)} alt=
                {String(last.altKey)} meta={String(last.metaKey)}
              </dd>
            </dl>
            <CopyPre
              text={json}
              onCopySuccess={() => onToast("JSON copied!")}
              title="Copy as JSON"
              className="border border-border rounded-control bg-surface-code"
              preClassName="p-3 font-mono text-xs text-fg-soft"
            />
          </>
        )}
      </Panel>
    </div>
  );
}
