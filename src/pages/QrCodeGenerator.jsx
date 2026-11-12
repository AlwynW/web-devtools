import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { DownloadSimple, QrCode } from "phosphor-react";
import QrReader from "../components/QrReader";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";
import SegmentedControl from "../components/ui/SegmentedControl";
import Button from "../components/Button";

const MODES = [
  { value: "text", label: "Text" },
  { value: "vcard", label: "vCard" },
  { value: "wifi", label: "WiFi" },
];

const SIZES = [
  { value: 256, label: "Default (256)" },
  { value: 500, label: "500" },
  { value: 800, label: "800" },
  { value: 1024, label: "1024" },
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

const DIRECTIONS = [
  { value: "generate", label: "Generate" },
  { value: "read", label: "Read" },
];

export default function QrCodeGenerator({ onToast }) {
  const [direction, setDirection] = useState("generate");
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
      <PageHeader title="QR Code" description="Generate a code from text, or read one from an image, clipboard, or camera." />

      <Panel className="space-y-6">
        <SegmentedControl
          options={DIRECTIONS}
          value={direction}
          onChange={setDirection}
        />

        {direction === "read" ? (
          <QrReader onToast={onToast} />
        ) : (
        <>
        <SegmentedControl options={MODES} value={mode} onChange={setMode} />

        {mode === "text" && (
          <div>
            <Label>
              Text
            </Label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="> enter text to encode"
              className="w-full h-24 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
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
                <Label className="mb-1">
                  {label}
                </Label>
                <input
                  type="text"
                  value={vcard[key]}
                  onChange={(e) =>
                    setVcard((v) => ({ ...v, [key]: e.target.value }))
                  }
                  placeholder={label}
                  className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                />
              </div>
            ))}
          </div>
        )}

        {mode === "wifi" && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1">
                Network name (SSID)
              </Label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) =>
                  setWifi((v) => ({ ...v, ssid: e.target.value }))
                }
                placeholder="My WiFi"
                className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div>
              <Label className="mb-1">
                Password
              </Label>
              <input
                type="password"
                value={wifi.password}
                onChange={(e) =>
                  setWifi((v) => ({ ...v, password: e.target.value }))
                }
                placeholder="••••••••"
                className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <Label className="mb-1">
                  Security
                </Label>
                <select
                  value={wifi.auth}
                  onChange={(e) =>
                    setWifi((v) => ({ ...v, auth: e.target.value }))
                  }
                  className="p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
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
                  className="border-border-muted focus:ring-focus"
                />
                <span className="text-sm font-mono text-fg-muted">
                  Hidden network
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-fg-muted">
              Foreground
            </label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-10 h-10 border border-border-strong rounded-control cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-fg-muted">{fgColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-fg-muted">
              Background
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 border border-border-strong rounded-control cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-fg-muted">{bgColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-mono text-fg-muted">
              Size
            </label>
            <SegmentedControl options={SIZES} value={size} onChange={setSize} />
          </div>
        </div>

        {error && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {qrSvg && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                icon={DownloadSimple}
                onClick={saveSvg}
              >
                SVG
              </Button>
              <Button
                variant="outline"
                icon={DownloadSimple}
                onClick={() => savePng(false)}
              >
                PNG (with bg)
              </Button>
              <Button
                variant="outline"
                icon={DownloadSimple}
                onClick={() => savePng(true)}
              >
                PNG (transparent)
              </Button>
            </div>
            <div
              className="p-4 bg-surface border border-border rounded-control overflow-hidden w-fit"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
        )}

        {!qrSvg && encodedText.trim() && (
          <div className="flex items-center gap-3 p-4 bg-surface-muted border border-border rounded-control text-fg-muted">
            <QrCode size={24} weight="thin" className="shrink-0" />
            <span className="text-sm font-mono">Generating QR code...</span>
          </div>
        )}
        </>
        )}
      </Panel>
    </div>
  );
}
