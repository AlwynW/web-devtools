import { useState, useEffect, useCallback } from "react";
import { ClipboardText } from "phosphor-react";
import * as jose from "jose";
import { copyToClipboard } from "../utils/clipboard";

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

  const copy = (text, msg) =>
    copyToClipboard(text, () => onToast(msg || "Copied!"));

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          JWT Debugger
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Decode, verify (HS256), and create signed JWTs (HS256 / RS256).
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          {[
            { id: "decode", label: "Decode" },
            { id: "create", label: "Create" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setError(null);
                if (m.id === "create") setCreatedToken("");
              }}
              className={`px-3 py-1.5 transition-colors ${
                mode === m.id
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "decode" && (
          <>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              JWT Token
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-24 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />

            {decoded && decodeHeaderAlg === "HS256" && (
              <div className="space-y-2 p-4 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/50">
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                  Verify HS256 signature
                </label>
                <input
                  type="password"
                  value={verifySecret}
                  onChange={(e) => {
                    setVerifySecret(e.target.value);
                    setVerifyResult(null);
                  }}
                  placeholder="Shared secret"
                  className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-90"
                >
                  Verify
                </button>
                {verifyResult && (
                  <p
                    className={`text-sm font-mono ${verifyResult.ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-300"}`}
                  >
                    {verifyResult.msg}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {decoded && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                      Header
                    </label>
                    <button
                      type="button"
                      onClick={() => copy(decoded.header, "Header copied!")}
                      className="p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
                    >
                      <ClipboardText size={16} weight="thin" />
                    </button>
                  </div>
                  <pre className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-sm overflow-x-auto text-stone-800 dark:text-stone-200">
                    {decoded.header}
                  </pre>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                      Payload
                    </label>
                    <button
                      type="button"
                      onClick={() => copy(decoded.payload, "Payload copied!")}
                      className="p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
                    >
                      <ClipboardText size={16} weight="thin" />
                    </button>
                  </div>
                  <pre className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-sm overflow-x-auto text-stone-800 dark:text-stone-200">
                    {decoded.payload}
                  </pre>
                  {(decoded.exp || decoded.iat || decoded.sub) && (
                    <div className="mt-2 text-xs text-stone-500 space-y-1 font-mono">
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
                  <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] block mb-2">
                    Signature (Base64URL)
                  </label>
                  <pre className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-xs break-all text-stone-800 dark:text-stone-200">
                    {decoded.signature}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "create" && (
          <>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Header (JSON)
              </label>
              <textarea
                value={createHeader}
                onChange={(e) => setCreateHeader(e.target.value)}
                className="w-full h-20 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                placeholder='{"alg":"HS256","typ":"JWT"}'
              />
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Use <code className="text-stone-700 dark:text-stone-300">alg</code>{" "}
                <strong className="font-normal">HS256</strong> (secret) or{" "}
                <strong className="font-normal">RS256</strong> (PKCS#8 PEM private key
                below).
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Payload (JSON)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { label: "+15m", s: 15 * 60 },
                  { label: "+1h", s: 3600 },
                  { label: "+24h", s: 86400 },
                  { label: "+7d", s: 86400 * 7 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyExpiryPreset(p.s)}
                    className="px-2 py-1 text-[11px] font-mono border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  >
                    exp {p.label}
                  </button>
                ))}
              </div>
              <textarea
                value={createPayload}
                onChange={(e) => setCreatePayload(e.target.value)}
                className="w-full h-36 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                placeholder='{"sub":"user@example.com","iat":...,"exp":...}'
              />
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Empty <code className="text-stone-700 dark:text-stone-300">iss</code>{" "}
                / <code className="text-stone-700 dark:text-stone-300">aud</code> are
                omitted from the signed payload.
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Secret (HS256) or PKCS#8 PEM private key (RS256)
              </label>
              <textarea
                value={createSecret}
                onChange={(e) => setCreateSecret(e.target.value)}
                placeholder="HS256: your-256-bit-secret — RS256: -----BEGIN PRIVATE KEY----- ..."
                rows={4}
                className="w-full p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleCreate}
              disabled={signing}
              className="w-full py-3 font-mono text-xs tracking-tight border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              {signing ? "Signing…" : " > Sign & Create JWT"}
            </button>
            {createdToken && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                    Created Token
                  </label>
                  <button
                    type="button"
                    onClick={() => copy(createdToken, "Token copied!")}
                    className="p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
                  >
                    <ClipboardText size={16} weight="thin" />
                  </button>
                </div>
                <pre className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-xs break-all overflow-x-auto text-stone-800 dark:text-stone-200">
                  {createdToken}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
