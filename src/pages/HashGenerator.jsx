import { useState, useCallback, useEffect } from "react";
import { UploadSimple } from "phosphor-react";
import CryptoJS from "crypto-js";
import CopyArea from "../components/CopyArea";

const hashFunctions = {
  MD5: (str) => CryptoJS.MD5(str).toString(CryptoJS.enc.Hex),
  "SHA-1": (str) => CryptoJS.SHA1(str).toString(CryptoJS.enc.Hex),
  "SHA-256": (str) => CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex),
  "SHA-512": (str) => CryptoJS.SHA512(str).toString(CryptoJS.enc.Hex),
};

export default function HashGenerator({ onToast }) {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({});
  const [mode, setMode] = useState("text");
  const [fileName, setFileName] = useState("");

  const compute = useCallback(() => {
    if (!input) {
      setHashes({});
      return;
    }
    const results = {};
    const data =
      mode === "file"
        ? CryptoJS.enc.Latin1.parse(input)
        : input;
    const algoMap = { "SHA-1": "SHA1", "SHA-256": "SHA256", "SHA-512": "SHA512", MD5: "MD5" };
    for (const [name, fn] of Object.entries(hashFunctions)) {
      results[name] =
        mode === "file"
          ? CryptoJS[algoMap[name]](data).toString(CryptoJS.enc.Hex)
          : fn(input);
    }
    setHashes(results);
  }, [input, mode]);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setInput(reader.result);
      setMode("file");
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }, []);

  useEffect(() => {
    if (input) compute();
    else setHashes({});
  }, [input, compute]);

  const switchToText = () => {
    setMode("text");
    setInput("");
    setFileName("");
    setHashes({});
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Hash Generator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Create MD5, SHA-1, SHA-256, or SHA-512 hashes for verification.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          <button
            onClick={switchToText}
            className={`px-3 py-1.5 transition-colors ${
              mode === "text"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            Text
          </button>
          <label
            className={`px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-2 ${
              mode === "file"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <input
              type="file"
              onChange={handleFile}
              className="hidden"
            />
            <UploadSimple size={14} weight="thin" /> File
          </label>
        </div>

        {mode === "text" ? (
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Input text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={compute}
              placeholder="> enter text to hash"
              className="w-full h-32 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
        ) : (
          <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
            <div className="font-mono text-sm text-stone-800 dark:text-stone-200">{fileName}</div>
            <div className="text-xs font-mono text-stone-500">
              {(input.length / 1024).toFixed(1)} KB loaded
            </div>
          </div>
        )}

        {mode === "text" && (
          <div className="flex justify-end">
            <button
              onClick={compute}
              className="px-4 py-2 border border-stone-400 dark:border-stone-600 text-xs font-mono tracking-tight text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {" > Generate hashes"}
            </button>
          </div>
        )}

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
              Hashes
            </label>
            {Object.entries(hashes).map(([name, hash]) => (
              <div key={name}>
                <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                  {name}
                </div>
                <CopyArea
                  text={hash}
                  onCopySuccess={() => onToast(`${name} copied!`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
