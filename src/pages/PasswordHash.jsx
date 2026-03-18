import { useState } from "react";
import bcrypt from "bcryptjs";
import CopyArea from "../components/CopyArea";

export default function PasswordHash({ onToast }) {
  const [mode, setMode] = useState("hash");
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [cost, setCost] = useState(10);
  const [hashOutput, setHashOutput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const doHash = async () => {
    setHashOutput("");
    if (!password) return;
    setLoading(true);
    try {
      const hashed = await bcrypt.hash(password, cost);
      setHashOutput(hashed);
    } catch (e) {
      setHashOutput("Error: " + (e.message || "Hash failed"));
    } finally {
      setLoading(false);
    }
  };

  const doVerify = async () => {
    setVerifyResult(null);
    if (!password || !hash) return;
    setLoading(true);
    try {
      const match = await bcrypt.compare(password, hash);
      setVerifyResult(match ? "Match" : "No match");
    } catch (e) {
      setVerifyResult("Error: " + (e.message || "Verify failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Bcrypt / Password Hash
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Hash passwords with bcrypt and verify against stored hashes.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          <button
            onClick={() => setMode("hash")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "hash"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            Hash
          </button>
          <button
            onClick={() => setMode("verify")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "verify"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            Verify
          </button>
        </div>

        {mode === "hash" && (
          <>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to hash"
                className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Cost factor (4–12)
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value, 10) || 10)}
                className="w-24 p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <button
              onClick={doHash}
              disabled={!password || loading}
              className="px-4 py-2 border border-stone-400 dark:border-stone-600 text-xs font-mono tracking-tight text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Hashing…" : "Hash"}
            </button>
            {hashOutput && (
              <>
                {hashOutput.startsWith("Error") ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {hashOutput}
                  </div>
                ) : (
                  <>
                    <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                      Hash
                    </label>
                    <CopyArea text={hashOutput} onCopySuccess={() => onToast("Copied!")} />
                  </>
                )}
              </>
            )}
          </>
        )}

        {mode === "verify" && (
          <>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password to verify"
                className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Stored hash
              </label>
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="$2a$10$..."
                className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <button
              onClick={doVerify}
              disabled={!password || !hash || loading}
              className="px-4 py-2 border border-stone-400 dark:border-stone-600 text-xs font-mono tracking-tight text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
            {verifyResult && (
              <div
                className={`p-4 font-mono text-sm ${
                  verifyResult === "Match"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    : verifyResult === "No match"
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                }`}
              >
                {verifyResult}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
