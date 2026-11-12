import { useState } from "react";
import bcrypt from "bcryptjs";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";
import Button from "../components/Button";
import SegmentedControl from "../components/ui/SegmentedControl";

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
      <PageHeader title="Bcrypt / Password Hash" description="Hash passwords with bcrypt and verify against stored hashes." />

      <Panel className="space-y-6">
        <SegmentedControl
          options={[
            { value: "hash", label: "Hash" },
            { value: "verify", label: "Verify" },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === "hash" && (
          <>
            <div>
              <Label>
                Password
              </Label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to hash"
                className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div>
              <Label>
                Cost factor (4–12)
              </Label>
              <input
                type="number"
                min="4"
                max="12"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value, 10) || 10)}
                className="w-24 p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <Button
              variant="outline"
              onClick={doHash}
              disabled={!password || loading}
              className="w-fit"
            >
              {loading ? "Hashing…" : "Hash"}
            </Button>
            {hashOutput && (
              <>
                {hashOutput.startsWith("Error") ? (
                  <ErrorBanner className="p-4 text-sm">
                    {hashOutput}
                  </ErrorBanner>
                ) : (
                  <>
                    <Label>
                      Hash
                    </Label>
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
              <Label>
                Password
              </Label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password to verify"
                className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div>
              <Label>
                Stored hash
              </Label>
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="$2a$10$..."
                className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <Button
              variant="outline"
              onClick={doVerify}
              disabled={!password || !hash || loading}
              className="w-fit"
            >
              {loading ? "Verifying…" : "Verify"}
            </Button>
            {verifyResult && (
              <div
                className={`p-4 font-mono text-sm rounded-control ${
                  verifyResult === "Match"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    : verifyResult === "No match"
                      ? "bg-warning-bg border border-warning-border text-warning-fg"
                      : "bg-danger-bg border border-danger-border text-danger-fg"
                }`}
              >
                {verifyResult}
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
