import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { DownloadSimple, QrCode } from "phosphor-react";

const MODES = [
  { id: "text", label: "Text" },
  { id: "vcard", label: "vCard" },
  { id: "wifi", label: "WiFi" },
];

const SIZES = [
  { id: 256, label: "Default (256)" },
  { id: 500, label: "500" },
  { id: 800, label: "800" },
  { id: 1024, label: "1024" },
];

function hexToRgba(hex, alpha = 255) {
  if (!hex || hex === "transparent") return "#00000000";
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = Math.round(alpha).toString(16).padStart(2, "0");
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${a}`;
}

function buildVCard(fields) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fields.name || ""}`,
    `N:${fields.lastName || ""};${fields.firstName || ""};;;`,
  ];
  if (fields.phone) lines.push(`TEL;TYPE=CELL:${fields.phone}`);
  if (fields.email) lines.push(`EMAIL:${fields.email}`);
  if (fields.org) lines.push(`ORG:${fields.org}`);
  if (fields.address) lines.push(`ADR:;;${fields.address};;;;`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function buildWifiString(fields) {
  const enc = (s) => (s ? s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/"/g, '\\"') : "");
  const parts = [];
  if (fields.auth && fields.auth !== "nopass") parts.push(`T:${fields.auth}`);
  parts.push(`S:${enc(fields.ssid || "")}`);
  if (fields.password) parts.push(`P:${enc(fields.password)}`);
  if (fields.hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

export default function QrCodeGenerator({ onToast }) {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [vcard, setVcard] = useState({
    firstName: "",
    lastName: "",
    name: "",
    phone: "",
    email: "",
    org: "",
    address: "",
  });
  const [wifi, setWifi] = useState({
    ssid: "",
    password: "",
    auth: "WPA",
    hidden: false,
  });
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const [qrSvg, setQrSvg] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [error, setError] = useState(null);

  const getEncodedText = useCallback(() => {
    if (mode === "text") return text;
    if (mode === "vcard") return buildVCard(vcard);
    if (mode === "wifi") return buildWifiString(wifi);
    return "";
  }, [mode, text, vcard, wifi]);

  const encodedText = getEncodedText();

  useEffect(() => {
    setError(null);
    if (!encodedText.trim()) {
      setQrSvg(null);
      setQrDataUrl(null);
      return;
    }
    const opts = {
      margin: 2,
      width: size,
      color: {
        dark: hexToRgba(fgColor),
        light: hexToRgba(bgColor),
      },
    };
    Promise.all([
      QRCode.toString(encodedText, { ...opts, type: "svg" }),
      QRCode.toDataURL(encodedText, { ...opts, type: "image/png" }),
    ])
      .then(([svg, dataUrl]) => {
        setQrSvg(svg);
        setQrDataUrl(dataUrl);
      })
      .catch((e) => {
        setError(e.message || "Failed to generate QR code");
        setQrSvg(null);
        setQrDataUrl(null);
      });
  }, [encodedText, fgColor, bgColor, size]);

  const saveSvg = useCallback(() => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
    onToast?.("SVG saved!");
  }, [qrSvg, onToast]);

  const savePng = useCallback(
    (transparent) => {
      if (!encodedText.trim()) return;
      const opts = {
        margin: 2,
        width: size,
        color: {
          dark: hexToRgba(fgColor),
          light: transparent ? "#00000000" : hexToRgba(bgColor),
        },
      };
      QRCode.toDataURL(encodedText, opts)
        .then((dataUrl) => {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `qrcode-${transparent ? "transparent" : "bg"}.png`;
          a.click();
          onToast?.(`PNG saved (${transparent ? "transparent" : "with background"})!`);
        })
        .catch((e) => setError(e.message));
    },
    [encodedText, fgColor, bgColor, size, onToast]
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          QR Code Generator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Generate QR codes for text, vCards, or WiFi credentials.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
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

        {mode === "text" && (
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="> enter text to encode"
              className="w-full h-24 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
        )}

        {mode === "vcard" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "firstName", label: "First name" },
              { key: "lastName", label: "Last name" },
              { key: "name", label: "Full name (FN)" },
              { key: "phone", label: "Phone" },
              { key: "email", label: "Email" },
              { key: "org", label: "Organization" },
              { key: "address", label: "Address", span: 2 },
            ].map(({ key, label, span }) => (
              <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={vcard[key]}
                  onChange={(e) =>
                    setVcard((v) => ({ ...v, [key]: e.target.value }))
                  }
                  placeholder={label}
                  className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                />
              </div>
            ))}
          </div>
        )}

        {mode === "wifi" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                Network name (SSID)
              </label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) =>
                  setWifi((v) => ({ ...v, ssid: e.target.value }))
                }
                placeholder="My WiFi"
                className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                Password
              </label>
              <input
                type="password"
                value={wifi.password}
                onChange={(e) =>
                  setWifi((v) => ({ ...v, password: e.target.value }))
                }
                placeholder="••••••••"
                className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                  Security
                </label>
                <select
                  value={wifi.auth}
                  onChange={(e) =>
                    setWifi((v) => ({ ...v, auth: e.target.value }))
                  }
                  className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No password</option>
                </select>
              </div>
              <label className="flex items-center gap-2 mt-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifi.hidden}
                  onChange={(e) =>
                    setWifi((v) => ({ ...v, hidden: e.target.checked }))
                  }
                  className="border-stone-400 focus:ring-stone-500"
                />
                <span className="text-sm font-mono text-stone-600 dark:text-stone-300">
                  Hidden network
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-stone-600 dark:text-stone-300">
              Foreground
            </label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-10 h-10 border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-stone-500">{fgColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-stone-600 dark:text-stone-300">
              Background
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-stone-500">{bgColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-stone-600 dark:text-stone-300">
              Size
            </label>
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`px-3 py-1.5 transition-colors ${
                    size === s.id
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {qrSvg && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveSvg}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
              >
                <DownloadSimple size={16} weight="thin" /> SVG
              </button>
              <button
                onClick={() => savePng(false)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
              >
                <DownloadSimple size={16} weight="thin" /> PNG (with bg)
              </button>
              <button
                onClick={() => savePng(true)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
              >
                <DownloadSimple size={16} weight="thin" /> PNG (transparent)
              </button>
            </div>
            <div
              className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 w-fit"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
        )}

        {!qrSvg && encodedText.trim() && (
          <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500">
            <QrCode size={24} weight="thin" className="shrink-0" />
            <span className="text-sm font-mono">Generating QR code...</span>
          </div>
        )}
      </div>
    </div>
  );
}
