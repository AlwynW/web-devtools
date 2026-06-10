import { useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import CopyPre from "../components/CopyPre";

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
              <span className="block text-stone-500 text-xs mb-2">Hex</span>
              <CopyPre
                text={hex}
                onCopySuccess={() => onToast("Copied!")}
                className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950"
                preClassName="p-3 text-xs break-all text-stone-800 dark:text-stone-200"
              />
            </div>
            <div>
              <span className="block text-stone-500 text-xs mb-2">Base64</span>
              <CopyPre
                text={b64}
                onCopySuccess={() => onToast("Copied!")}
                className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950"
                preClassName="p-3 text-xs break-all text-stone-800 dark:text-stone-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
