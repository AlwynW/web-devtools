import { useState, useCallback, useEffect } from "react";
import { Upload } from "lucide-react";
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
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Hash Generator
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Create MD5, SHA-1, SHA-256, or SHA-512 hashes for verification.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max">
          <button
            onClick={switchToText}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              mode === "text"
                ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Text
          </button>
          <label
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all cursor-pointer ${
              mode === "file"
                ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <input
              type="file"
              onChange={handleFile}
              className="hidden"
            />
            <span className="flex items-center gap-2">
              <Upload size={16} /> File
            </span>
          </label>
        </div>

        {mode === "text" ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Input text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={compute}
              placeholder="Enter text to hash..."
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-medium dark:text-slate-200">{fileName}</div>
            <div className="text-sm text-slate-500">
              {(input.length / 1024).toFixed(1)} KB loaded
            </div>
          </div>
        )}

        {mode === "text" && (
          <button
            onClick={compute}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Generate hashes
          </button>
        )}

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Hashes
            </label>
            {Object.entries(hashes).map(([name, hash]) => (
              <div key={name}>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
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
