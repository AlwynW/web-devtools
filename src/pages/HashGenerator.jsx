import { useState, useCallback, useEffect } from "react";
import { UploadSimple } from "phosphor-react";
import CryptoJS from "crypto-js";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

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
      <PageHeader title="Hash Generator" description="Create MD5, SHA-1, SHA-256, or SHA-512 hashes for verification." />

      <Panel className="space-y-4">
        <div className="flex gap-1 p-1 bg-surface-sunken border border-border-strong rounded-button w-max font-medium text-xs">
          <button
            type="button"
            onClick={switchToText}
            aria-pressed={mode === "text"}
            className={`px-3 py-1.5 transition-colors rounded-button ${
              mode === "text"
                ? "bg-primary text-primary-fg"
                : "text-fg-muted hover:bg-hover-muted hover:text-fg"
            }`}
          >
            Text
          </button>
          <label
            className={`px-3 py-1.5 transition-colors rounded-button cursor-pointer flex items-center gap-2 ${
              mode === "file"
                ? "bg-primary text-primary-fg"
                : "text-fg-muted hover:bg-hover-muted hover:text-fg"
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
            <Label>
              Input text
            </Label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={compute}
              placeholder="> enter text to hash"
              className="w-full h-32 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
        ) : (
          <div className="p-4 bg-surface-muted border border-border rounded-control">
            <div className="font-mono text-sm text-fg-soft">{fileName}</div>
            <div className="text-xs font-mono text-fg-muted">
              {(input.length / 1024).toFixed(1)} KB loaded
            </div>
          </div>
        )}

        {mode === "text" && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={compute}>
              {" > Generate hashes"}
            </Button>
          </div>
        )}

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            <Label>
              Hashes
            </Label>
            {Object.entries(hashes).map(([name, hash]) => (
              <div key={name}>
                <div className="field-label mb-1">
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
      </Panel>
    </div>
  );
}
