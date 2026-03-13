import { useState, useEffect, useCallback } from "react";
import { ClipboardCopy } from "lucide-react";
import CryptoJS from "crypto-js";
import { copyToClipboard } from "../utils/clipboard";

const base64UrlEncode = (str) => {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

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
const DEFAULT_PAYLOAD = { sub: "user@example.com", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };

const signJwt = (header, payload, secret, alg = "HS256") => {
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;
  const sig = CryptoJS.HmacSHA256(unsigned, secret).toString(CryptoJS.enc.Base64);
  const sigB64 = sig.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${unsigned}.${sigB64}`;
};

export default function JwtDebugger({ onToast }) {
  const [mode, setMode] = useState("decode");
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState(null);

  const [createHeader, setCreateHeader] = useState(JSON.stringify(DEFAULT_HEADER, null, 2));
  const [createPayload, setCreatePayload] = useState(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [createSecret, setCreateSecret] = useState("");
  const [createdToken, setCreatedToken] = useState("");

  const decode = useCallback(() => {
    setError(null);
    setDecoded(null);
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
    }
  }, [input, decode]);

  const copy = (text, msg) =>
    copyToClipboard(text, () => onToast(msg || "Copied!"));

  const handleCreate = () => {
    setError(null);
    setCreatedToken("");
    try {
      const header = JSON.parse(createHeader);
      const payload = JSON.parse(createPayload);
      if (!createSecret.trim()) {
        setError("Secret is required for signing");
        return;
      }
      const token = signJwt(header, payload, createSecret, header.alg || "HS256");
      setCreatedToken(token);
    } catch (e) {
      setError(e.message || "Invalid JSON in header or payload");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          JWT Debugger
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Decode and create JWT tokens (HS256).
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-max">
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
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                mode === m.id
                  ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "decode" && (
          <>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          JWT Token
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
        />

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {decoded && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Header
                </label>
                <button
                  onClick={() => copy(decoded.header, "Header copied!")}
                  className="text-slate-400 hover:text-blue-600 p-1"
                >
                  <ClipboardCopy size={16} />
                </button>
              </div>
              <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-sm overflow-x-auto dark:text-slate-200">
                {decoded.header}
              </pre>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payload
                </label>
                <button
                  onClick={() => copy(decoded.payload, "Payload copied!")}
                  className="text-slate-400 hover:text-blue-600 p-1"
                >
                  <ClipboardCopy size={16} />
                </button>
              </div>
              <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-sm overflow-x-auto dark:text-slate-200">
                {decoded.payload}
              </pre>
              {(decoded.exp || decoded.iat || decoded.sub) && (
                <div className="mt-2 text-xs text-slate-500 space-y-1">
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Signature (Base64URL)
              </label>
              <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-xs break-all dark:text-slate-200">
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Header (JSON)
              </label>
              <textarea
                value={createHeader}
                onChange={(e) => setCreateHeader(e.target.value)}
                className="w-full h-20 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder='{"alg":"HS256","typ":"JWT"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payload (JSON)
              </label>
              <textarea
                value={createPayload}
                onChange={(e) => setCreatePayload(e.target.value)}
                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder='{"sub":"user@example.com","iat":...,"exp":...}'
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: iat and exp are Unix timestamps (seconds). Use current time + 3600 for 1h expiry.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Secret (for HS256)
              </label>
              <input
                type="password"
                value={createSecret}
                onChange={(e) => setCreateSecret(e.target.value)}
                placeholder="your-256-bit-secret"
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleCreate}
              className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Sign & Create JWT
            </button>
            {createdToken && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Created Token
                  </label>
                  <button
                    onClick={() => copy(createdToken, "Token copied!")}
                    className="text-slate-400 hover:text-blue-600 p-1"
                  >
                    <ClipboardCopy size={16} />
                  </button>
                </div>
                <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-xs break-all overflow-x-auto dark:text-slate-200">
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
