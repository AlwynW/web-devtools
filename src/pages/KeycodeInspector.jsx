import { useState, useRef, useEffect, useCallback } from "react";
import CopyPre from "../components/CopyPre";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Key inspector
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Focus the box and press keys. Uses <code className="text-stone-600 dark:text-stone-300">keydown</code>{" "}
          (modifiers and legacy <code className="text-stone-600 dark:text-stone-300">which</code>).
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div
          ref={boxRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="min-h-[8rem] p-6 border-2 border-dashed border-stone-400 dark:border-stone-600 rounded font-mono text-sm text-stone-600 dark:text-stone-400 outline-none focus:border-stone-900 dark:focus:border-stone-300 focus:ring-1 focus:ring-stone-500"
        >
          Click here, then type…
        </div>

        {last && (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-stone-800 dark:text-stone-200">
              <dt className="text-stone-500">key</dt>
              <dd>{JSON.stringify(last.key)}</dd>
              <dt className="text-stone-500">code</dt>
              <dd>{last.code}</dd>
              <dt className="text-stone-500">which</dt>
              <dd>{last.which}</dd>
              <dt className="text-stone-500">location</dt>
              <dd>{last.location}</dd>
              <dt className="text-stone-500">repeat</dt>
              <dd>{String(last.repeat)}</dd>
              <dt className="text-stone-500">modifiers</dt>
              <dd>
                ctrl={String(last.ctrlKey)} shift={String(last.shiftKey)} alt=
                {String(last.altKey)} meta={String(last.metaKey)}
              </dd>
            </dl>
            <CopyPre
              text={json}
              onCopySuccess={() => onToast("JSON copied!")}
              title="Copy as JSON"
              className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950"
              preClassName="p-3 font-mono text-xs text-stone-700 dark:text-stone-300"
            />
          </>
        )}
      </div>
    </div>
  );
}
