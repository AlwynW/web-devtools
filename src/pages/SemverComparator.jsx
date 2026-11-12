import { useMemo, useState } from "react";
import { compare, diff, satisfies, valid, validRange, coerce } from "semver";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

export default function SemverComparator() {
  const [a, setA] = useState("1.2.3");
  const [b, setB] = useState("1.2.4");
  const [range, setRange] = useState("^1.0.0");

  const result = useMemo(() => {
    const va = valid(a) ? a : null;
    const vb = valid(b) ? b : null;
    const ca = coerce(a)?.version ?? null;
    const cb = coerce(b)?.version ?? null;
    const vr = validRange(range);

    let compareMsg = "";
    if (va && vb) {
      const c = compare(va, vb);
      compareMsg =
        c === 0 ? "equal" : c < 0 ? `${va} < ${vb}` : `${va} > ${vb}`;
    } else if (ca && cb && !va && !vb) {
      compareMsg = `Coerced: ${ca} vs ${cb} (enter valid semver for strict compare)`;
    } else {
      compareMsg = "Enter valid semver strings (e.g. 1.0.0).";
    }

    let diffLabel = "";
    if (va && vb) {
      try {
        diffLabel = diff(va, vb) || "none";
      } catch {
        diffLabel = "—";
      }
    }

    let satA = null;
    let satB = null;
    if (vr) {
      if (va) satA = satisfies(va, range);
      if (vb) satB = satisfies(vb, range);
    }

    return {
      compareMsg,
      diffLabel,
      satA,
      satB,
      rangeValid: !!vr,
      va,
      vb,
      ca,
      cb,
    };
  }, [a, b, range]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Semver comparator" description="Compare versions, diff release types, and test ranges." />

      <Panel className="space-y-6 font-mono text-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label mb-2">
              Version A
            </label>
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-full p-3 border border-border-strong rounded-control bg-surface text-fg"
            />
          </div>
          <div>
            <label className="field-label mb-2">
              Version B
            </label>
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-full p-3 border border-border-strong rounded-control bg-surface text-fg"
            />
          </div>
        </div>

        <div>
          <label className="field-label mb-2">
            Range (npm style)
          </label>
          <input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full p-3 border border-border-strong rounded-control bg-surface text-fg"
            placeholder="^1.0.0, >=2 <3, 1.x"
          />
          {!result.rangeValid && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Invalid range
            </p>
          )}
        </div>

        <div className="space-y-2 p-4 bg-surface-code border border-border rounded-control text-fg-soft">
          <p>
            <span className="text-fg-muted">Compare: </span>
            {result.compareMsg}
          </p>
          {result.diffLabel && (
            <p>
              <span className="text-fg-muted">diff(): </span>
              {result.diffLabel}
            </p>
          )}
          {result.rangeValid && (result.va || result.vb) && (
            <div className="pt-2 border-t border-border space-y-1">
              <p className="text-fg-muted">satisfies(range):</p>
              {result.va != null && (
                <p>
                  A ({result.va}):{" "}
                  <strong>{result.satA ? "yes" : "no"}</strong>
                </p>
              )}
              {result.vb != null && (
                <p>
                  B ({result.vb}):{" "}
                  <strong>{result.satB ? "yes" : "no"}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
