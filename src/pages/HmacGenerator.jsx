import { useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import { copyToClipboard } from "../utils/clipboard";

export default function HmacGenerator({ onToast }) {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [alg, setAlg] = useState("SHA256");

  const { hex, b64, err } = useMemo(() => {
    if (!secret) {
      return { hex: "", b64: "", err: null };
    }
    try {
      if (alg === "SHA256") {
        const h = CryptoJS.HmacSHA256(message, secret);
        return {
          hex: h.toString(CryptoJS.enc.Hex),
          b64: CryptoJS.enc.Base64.stringify(h),
          err: null,
        };
      }
      const h = CryptoJS.HmacSHA512(message, secret);
      return {
        hex: h.toString(CryptoJS.enc.Hex),
        b64: CryptoJS.enc.Base64.stringify(h),
        err: null,
      };
    } catch (e) {
      return { hex: "", b64: "", err: e.message || "Error" };
    }
  }, [secret, message, alg]);

  const copy = (text) =>
    text && copyToClipboard(text, () => onToast("Copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          HMAC
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          HMAC-SHA256 or HMAC-SHA512; hex and Base64 output. Runs only in your
          browser.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
            Algorithm
          </label>
          <select
            value={alg}
            onChange={(e) => setAlg(e.target.value)}
            className="p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          >
            <option value="SHA256">HMAC-SHA256</option>
            <option value="SHA512">HMAC-SHA512</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
            Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        {err && (
          <p className="text-sm text-red-600 dark:text-red-400 font-mono">{err}</p>
        )}

        {secret && (
          <div className="space-y-3 font-mono text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-500 text-xs">Hex</span>
                <button
                  type="button"
                  onClick={() => copy(hex)}
                  className="text-[11px] underline text-stone-600 dark:text-stone-400"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-xs break-all text-stone-800 dark:text-stone-200">
                {hex}
              </pre>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-500 text-xs">Base64</span>
                <button
                  type="button"
                  onClick={() => copy(b64)}
                  className="text-[11px] underline text-stone-600 dark:text-stone-400"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-xs break-all text-stone-800 dark:text-stone-200">
                {b64}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
