import { useState } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

function parseInput(value, base) {
  const trimmed = value.trim().replace(/^0x/i, "");
  if (!trimmed) return null;
  const num = parseInt(trimmed, base);
  return isNaN(num) || num < 0 ? null : num;
}

export default function HexConverter({ onToast }) {
  const [hex, setHex] = useState("");
  const [binary, setBinary] = useState("");
  const [decimal, setDecimal] = useState("");
  const [octal, setOctal] = useState("");

  const handleChange = (source, value) => {
    let num = null;
    if (source === "hex") num = parseInput(value, 16);
    else if (source === "binary") num = parseInput(value, 2);
    else if (source === "decimal") num = parseInput(value, 10);
    else if (source === "octal") num = parseInput(value, 8);

    if (num !== null) {
      setHex(num.toString(16).toUpperCase());
      setBinary(num.toString(2));
      setDecimal(num.toString(10));
      setOctal(num.toString(8));
    } else {
      setHex(source === "hex" ? value : "");
      setBinary(source === "binary" ? value : "");
      setDecimal(source === "decimal" ? value : "");
      setOctal(source === "octal" ? value : "");
    }
  };

  const hasValid = [hex, binary, decimal, octal].some((v) => {
    const n = parseInput(v, v === hex ? 16 : v === binary ? 2 : v === decimal ? 10 : 8);
    return n !== null;
  });
  const output = hasValid
    ? `Hex: ${hex || "—"}\nBinary: ${binary || "—"}\nDecimal: ${decimal || "—"}\nOctal: ${octal || "—"}`
    : "";

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Hex / Binary / Decimal Converter" description="Convert between hexadecimal, binary, decimal, and octal." />

      <Panel className="space-y-4">
        {[
          { key: "hex", label: "Hexadecimal", value: hex, set: setHex, placeholder: "FF" },
          { key: "binary", label: "Binary", value: binary, set: setBinary, placeholder: "11111111" },
          { key: "decimal", label: "Decimal", value: decimal, set: setDecimal, placeholder: "255" },
          { key: "octal", label: "Octal", value: octal, set: setOctal, placeholder: "377" },
        ].map(({ key, label, value, set, placeholder }) => (
          <div key={key}>
            <Label className="mb-1">
              {label}
            </Label>
            <input
              type="text"
              value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
        ))}

        {output && (
          <>
            <Label className="mt-4">
              Summary
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
