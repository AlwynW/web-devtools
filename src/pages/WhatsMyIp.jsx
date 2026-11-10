import { useState, useEffect, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";
import useOnlineStatus from "../hooks/useOnlineStatus";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";
import { WarningBanner } from "../components/ui/ErrorBanner";

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
  const online = useOnlineStatus();
  const [ipv4, setIpv4] = useState(null);
  const [ipv6, setIpv6] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!navigator.onLine) {
      setLoading(false);
      setError("Needs network. Connect to look up your public IP.");
      setIpv4(null);
      setIpv6(null);
      return;
    }
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
      setError(
        !navigator.onLine
          ? "Needs network. Connect to look up your public IP."
          : e.message || "Could not fetch your IP address",
      );
      setIpv4(null);
      setIpv6(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (online && error) {
      load();
    }
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps -- retry once when coming back online

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title={<>What&apos;s my IP?</>} description="Your public IP address as seen from the internet." />

      <Panel className="space-y-4">
        {!online && (
          <WarningBanner className="p-4 text-sm font-mono">
            Needs network. Connect to look up your public IP.
          </WarningBanner>
        )}

        {online && loading && (
          <div className="text-center py-8 text-fg-muted">
            Fetching your IP...
          </div>
        )}

        {online && error && !loading && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {online && !loading && !error && (
          <>
            <div className="space-y-4">
              {ipv4 && (
                <div>
                  <Label>
                    IPv4
                  </Label>
                  <CopyArea
                    text={ipv4}
                    onCopySuccess={() => onToast("IPv4 copied!")}
                  />
                </div>
              )}
              {ipv6 && (
                <div>
                  <Label>
                    IPv6
                  </Label>
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

        {online && !loading && error && (
          <div className="mt-2 flex justify-end">
            <Button onClick={load} icon={ArrowsClockwise}>
              Retry
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
