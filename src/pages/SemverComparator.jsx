import { useMemo, useState } from "react";
import { compare, diff, satisfies, valid, validRange, coerce } from "semver";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Semver comparator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Compare versions, diff release types, and test ranges.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6 font-mono text-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-2">
              Version A
            </label>
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-2">
              Version B
            </label>
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-2">
            Range (npm style)
          </label>
          <input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            placeholder="^1.0.0, >=2 <3, 1.x"
          />
          {!result.rangeValid && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Invalid range
            </p>
          )}
        </div>

        <div className="space-y-2 p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
          <p>
            <span className="text-stone-500">Compare: </span>
            {result.compareMsg}
          </p>
          {result.diffLabel && (
            <p>
              <span className="text-stone-500">diff(): </span>
              {result.diffLabel}
            </p>
          )}
          {result.rangeValid && (result.va || result.vb) && (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 space-y-1">
              <p className="text-stone-500">satisfies(range):</p>
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
      </div>
    </div>
  );
}
