import { useState, useEffect, useCallback } from "react";
import * as jose from "jose";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";
import SegmentedControl from "../components/ui/SegmentedControl";
import Button from "../components/Button";

const base64UrlDecode = (str) => {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=====".slice(0, 4 - pad);
    const decoded = atob(base64);
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
  } catch {
    return null;
  }
};

const DEFAULT_HEADER = { alg: "HS256", typ: "JWT" };
const DEFAULT_PAYLOAD = {
  sub: "user@example.com",
  iss: "",
  aud: "",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

function stripEmptyClaims(obj) {
  const next = { ...obj };
  if (next.iss === "" || next.iss == null) delete next.iss;
  if (next.aud === "" || next.aud == null) delete next.aud;
  return next;
}

export default function JwtDebugger({ onToast }) {
  const [mode, setMode] = useState("decode");
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [decodeHeaderAlg, setDecodeHeaderAlg] = useState(null);
  const [error, setError] = useState(null);
  const [verifySecret, setVerifySecret] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const [createHeader, setCreateHeader] = useState(
    JSON.stringify(DEFAULT_HEADER, null, 2),
  );
  const [createPayload, setCreatePayload] = useState(
    JSON.stringify(DEFAULT_PAYLOAD, null, 2),
  );
  const [createSecret, setCreateSecret] = useState("");
  const [createdToken, setCreatedToken] = useState("");
  const [signing, setSigning] = useState(false);

  const decode = useCallback(() => {
    setError(null);
    setDecoded(null);
    setDecodeHeaderAlg(null);
    setVerifyResult(null);
    const trimmed = input.trim();
    if (!trimmed) return;

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      setError("Invalid JWT: expected 3 parts (header.payload.signature)");
      return;
    }

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);

      if (!headerJson || !payloadJson) {
        setError("Invalid Base64URL in JWT parts");
        return;
      }

      const header = JSON.parse(headerJson);
      const payload = JSON.parse(payloadJson);
      setDecodeHeaderAlg(header.alg || null);

      setDecoded({
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature: parts[2],
        exp: payload.exp,
        iat: payload.iat,
        sub: payload.sub,
      });
    } catch (e) {
      setError(e.message || "Failed to decode JWT");
    }
  }, [input]);

  useEffect(() => {
    if (input.trim()) {
      const t = setTimeout(decode, 300);
      return () => clearTimeout(t);
    } else {
      setDecoded(null);
      setError(null);
      setDecodeHeaderAlg(null);
      setVerifyResult(null);
    }
  }, [input, decode]);

  const applyExpiryPreset = (secondsFromNow) => {
    setError(null);
    try {
      const payload = JSON.parse(createPayload);
      const now = Math.floor(Date.now() / 1000);
      payload.iat = now;
      payload.exp = now + secondsFromNow;
      setCreatePayload(JSON.stringify(payload, null, 2));
    } catch (e) {
      setError(e.message || "Invalid payload JSON");
    }
  };

  const handleCreate = async () => {
    setError(null);
    setCreatedToken("");
    setSigning(true);
    try {
      const header = JSON.parse(createHeader);
      const rawPayload = JSON.parse(createPayload);
      const payload = stripEmptyClaims(rawPayload);
      const rawAlg = String(header.alg || "HS256").toUpperCase();
      const alg = rawAlg === "RS256" ? "RS256" : "HS256";

      const protectedHeader = {
        alg,
        typ: header.typ || "JWT",
        ...(header.kid ? { kid: header.kid } : {}),
      };

      if (alg === "HS256") {
        if (!createSecret.trim()) {
          setError("Secret is required for HS256");
          return;
        }
        const secret = new TextEncoder().encode(createSecret);
        const jwt = await new jose.SignJWT(payload)
          .setProtectedHeader(protectedHeader)
          .sign(secret);
        setCreatedToken(jwt);
      } else if (alg === "RS256") {
        if (!createSecret.trim()) {
          setError("PEM private key is required for RS256");
          return;
        }
        const key = await jose.importPKCS8(createSecret.trim(), "RS256");
        const jwt = await new jose.SignJWT(payload)
          .setProtectedHeader(protectedHeader)
          .sign(key);
        setCreatedToken(jwt);
      } else {
        setError("Unsupported alg for signing. Use HS256 or RS256.");
      }
    } catch (e) {
      setError(e.message || "Invalid JSON or signing failed");
    } finally {
      setSigning(false);
    }
  };

  const handleVerify = async () => {
    setVerifyResult(null);
    const trimmed = input.trim();
    if (!trimmed || !verifySecret.trim()) {
      setVerifyResult({ ok: false, msg: "Token and secret are required." });
      return;
    }
    if (decodeHeaderAlg !== "HS256") {
      setVerifyResult({
        ok: false,
        msg: "In-browser verify supports HS256 only. RS256 needs a public key flow (not implemented here).",
      });
      return;
    }
    try {
      const secret = new TextEncoder().encode(verifySecret);
      await jose.jwtVerify(trimmed, secret, { algorithms: ["HS256"] });
      setVerifyResult({ ok: true, msg: "Signature valid (HS256)." });
      onToast?.("Signature valid");
    } catch {
      setVerifyResult({ ok: false, msg: "Invalid signature or token." });
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="JWT Debugger" description="Decode, verify (HS256), and create signed JWTs (HS256 / RS256)." />

      <Panel className="space-y-6">
        <SegmentedControl
          options={[
            { value: "decode", label: "Decode" },
            { value: "create", label: "Create" },
          ]}
          value={mode}
          onChange={(id) => {
            setMode(id);
            setError(null);
            if (id === "create") setCreatedToken("");
          }}
        />

        {mode === "decode" && (
          <>
            <Label>
              JWT Token
            </Label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-24 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />

            {decoded && decodeHeaderAlg === "HS256" && (
              <div className="space-y-2 p-4 border border-border rounded-control bg-surface-code/50">
                <Label>
                  Verify HS256 signature
                </Label>
                <input
                  type="password"
                  value={verifySecret}
                  onChange={(e) => {
                    setVerifySecret(e.target.value);
                    setVerifyResult(null);
                  }}
                  placeholder="Shared secret"
                  className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                />
                <Button onClick={handleVerify} className="w-fit">
                  Verify
                </Button>
                {verifyResult && (
                  <p
                    className={`text-sm font-mono ${verifyResult.ok ? "text-green-700 dark:text-green-400" : "text-danger-fg"}`}
                  >
                    {verifyResult.msg}
                  </p>
                )}
              </div>
            )}

            {error && (
              <ErrorBanner className="p-4 text-sm">
                {error}
              </ErrorBanner>
            )}

            {decoded && (
              <div className="space-y-4">
                <div>
                  <Label>
                    Header
                  </Label>
                  <CopyPre
                    text={decoded.header}
                    onCopySuccess={() => onToast("Header copied!")}
                    className="border border-border rounded-control bg-surface-muted overflow-x-auto"
                    preClassName="p-4 font-mono text-sm text-fg-soft"
                  />
                </div>

                <div>
                  <Label>
                    Payload
                  </Label>
                  <CopyPre
                    text={decoded.payload}
                    onCopySuccess={() => onToast("Payload copied!")}
                    className="border border-border rounded-control bg-surface-muted overflow-x-auto"
                    preClassName="p-4 font-mono text-sm text-fg-soft"
                  />
                  {(decoded.exp || decoded.iat || decoded.sub) && (
                    <div className="mt-2 text-xs text-fg-muted space-y-1 font-mono">
                      {decoded.exp && (
                        <div>
                          exp: {decoded.exp}{" "}
                          ({new Date(decoded.exp * 1000).toISOString()})
                        </div>
                      )}
                      {decoded.iat && (
                        <div>
                          iat: {decoded.iat}{" "}
                          ({new Date(decoded.iat * 1000).toISOString()})
                        </div>
                      )}
                      {decoded.sub && <div>sub: {decoded.sub}</div>}
                    </div>
                  )}
                </div>

                <div>
                  <Label>
                    Signature (Base64URL)
                  </Label>
                  <CopyPre
                    text={decoded.signature}
                    onCopySuccess={() => onToast("Copied!")}
                    className="border border-border rounded-control bg-surface-muted"
                    preClassName="p-4 font-mono text-xs break-all text-fg-soft"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {mode === "create" && (
          <>
            <div>
              <Label>
                Header (JSON)
              </Label>
              <textarea
                value={createHeader}
                onChange={(e) => setCreateHeader(e.target.value)}
                className="w-full h-20 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                placeholder='{"alg":"HS256","typ":"JWT"}'
              />
              <p className="text-xs text-fg-muted mt-1 font-mono">
                Use <code className="text-fg-soft">alg</code>{" "}
                <strong className="font-normal">HS256</strong> (secret) or{" "}
                <strong className="font-normal">RS256</strong> (PKCS#8 PEM private key
                below).
              </p>
            </div>
            <div>
              <Label>
                Payload (JSON)
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { label: "+15m", s: 15 * 60 },
                  { label: "+1h", s: 3600 },
                  { label: "+24h", s: 86400 },
                  { label: "+7d", s: 86400 * 7 },
                ].map((p) => (
                  <Button
                    key={p.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyExpiryPreset(p.s)}
                  >
                    exp {p.label}
                  </Button>
                ))}
              </div>
              <textarea
                value={createPayload}
                onChange={(e) => setCreatePayload(e.target.value)}
                className="w-full h-36 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                placeholder='{"sub":"user@example.com","iat":...,"exp":...}'
              />
              <p className="text-xs text-fg-muted mt-1 font-mono">
                Empty <code className="text-fg-soft">iss</code>{" "}
                / <code className="text-fg-soft">aud</code> are
                omitted from the signed payload.
              </p>
            </div>
            <div>
              <Label>
                Secret (HS256) or PKCS#8 PEM private key (RS256)
              </Label>
              <textarea
                value={createSecret}
                onChange={(e) => setCreateSecret(e.target.value)}
                placeholder="HS256: your-256-bit-secret — RS256: -----BEGIN PRIVATE KEY----- ..."
                rows={4}
                className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            {error && (
              <ErrorBanner className="p-4 text-sm">
                {error}
              </ErrorBanner>
            )}
            <Button onClick={handleCreate} disabled={signing} className="w-full">
              {signing ? "Signing…" : " > Sign & Create JWT"}
            </Button>
            {createdToken && (
              <div>
                <Label>
                  Created Token
                </Label>
                <CopyPre
                  text={createdToken}
                  onCopySuccess={() => onToast("Token copied!")}
                  className="border border-border rounded-control bg-surface-muted overflow-x-auto"
                  preClassName="p-4 font-mono text-xs break-all text-fg-soft"
                />
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
