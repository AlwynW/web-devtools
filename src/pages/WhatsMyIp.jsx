import { useState, useEffect, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

const fetchIp = async (version = "4") => {
  const url =
    version === "6"
      ? "https://api64.ipify.org?format=json"
      : "https://api.ipify.org?format=json";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch IP");
  const data = await res.json();
  return data.ip;
};

export default function WhatsMyIp({ onToast }) {
  const [ipv4, setIpv4] = useState(null);
  const [ipv6, setIpv6] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v4, v6] = await Promise.all([
        fetchIp("4"),
        fetchIp("6").catch(() => null),
      ]);
      setIpv4(v4);
      setIpv6(v6);
    } catch (e) {
      setError(e.message || "Could not fetch your IP address");
      setIpv4(null);
      setIpv6(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          What&apos;s my IP?
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Your public IP address as seen from the internet.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        {loading && (
          <div className="text-center py-8 text-stone-500">
            Fetching your IP...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="space-y-4">
              {ipv4 && (
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                    IPv4
                  </label>
                  <CopyArea
                    text={ipv4}
                    onCopySuccess={() => onToast("IPv4 copied!")}
                  />
                </div>
              )}
              {ipv6 && (
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                    IPv6
                  </label>
                  <CopyArea
                    text={ipv6}
                    onCopySuccess={() => onToast("IPv6 copied!")}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={load} icon={ArrowsClockwise}>
                Refresh
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
