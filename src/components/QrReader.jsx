import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ArrowSquareOut,
  Camera,
  CameraRotate,
  CameraSlash,
  ClipboardText,
  UploadSimple,
} from "phosphor-react";
import Button from "./Button";
import CopyButton from "./CopyButton";
import {
  decodeQrImageData,
  describeQr,
  loadImageElement,
  readQrFromDrawable,
} from "../utils/qrDecode";

const SOURCES = [
  { id: "upload", label: "Upload", icon: UploadSimple },
  { id: "clipboard", label: "Clipboard", icon: ClipboardText },
  { id: "webcam", label: "Webcam", icon: Camera },
];

const KIND_LABEL = {
  link: "Link",
  wifi: "WiFi",
  vcard: "vCard",
  text: "Text",
};

function isImageFile(file) {
  if (!file) return false;
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i.test(file.name || "");
}

function cameraErrorMessage(error) {
  const name = error?.name;
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera access was blocked. Allow the camera for this site, then try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is in use by another app.";
  }
  if (name === "OverconstrainedError") {
    return "That camera could not be opened.";
  }
  return "Could not start the camera.";
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
        {label}
      </div>
      <div className="font-mono text-sm text-stone-800 dark:text-stone-100 break-all">
        {value}
      </div>
    </div>
  );
}

export default function QrReader({ onToast }) {
  const fileInputId = useId();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const runRef = useRef(0);
  const activeRef = useRef(false);
  const lastScanRef = useRef(0);
  const pausedRef = useRef(false);
  const previewRef = useRef(null);
  const onToastRef = useRef(onToast);
  onToastRef.current = onToast;

  const [source, setSource] = useState("upload");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [contents, setContents] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cameraState, setCameraState] = useState("idle");
  const [cameras, setCameras] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [facingUser, setFacingUser] = useState(false);

  const replacePreview = useCallback((next) => {
    const prev = previewRef.current;
    previewRef.current = next;
    if (prev && prev !== next && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
    setPreview(next);
  }, []);

  const releaseStream = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stopCamera = useCallback(() => {
    runRef.current += 1;
    releaseStream();
    setCameraState("stopped");
  }, [releaseStream]);

  const publishResult = useCallback(
    (text, previewUrl) => {
      if (previewUrl) replacePreview(previewUrl);
      setContents(text);
      setError(null);
      onToastRef.current?.("QR code read");
    },
    [replacePreview]
  );

  const decodeFile = useCallback(
    async (file) => {
      if (!isImageFile(file)) {
        setContents(null);
        setError("Drop an image of a QR code (PNG, JPG, WebP, SVG).");
        return;
      }
      setBusy(true);
      setError(null);
      setContents(null);
      replacePreview(null);
      try {
        const img = await loadImageElement(file);
        const text = readQrFromDrawable(img);
        replacePreview(URL.createObjectURL(file));
        if (!text) {
          setContents(null);
          setError("No QR code found in that image.");
          return;
        }
        setContents(text);
        onToastRef.current?.("QR code read");
      } catch (err) {
        setContents(null);
        setError(err?.message || "Could not read that image.");
      } finally {
        setBusy(false);
      }
    },
    [replacePreview]
  );

  const startCamera = useCallback(
    async (nextDeviceId) => {
      stopCamera();
      const runId = runRef.current;
      pausedRef.current = false;
      setError(null);
      setContents(null);
      replacePreview(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("stopped");
        setError("This browser has no camera API. Upload or paste an image instead.");
        return;
      }

      setCameraState("starting");
      try {
        const video = nextDeviceId
          ? { deviceId: { exact: nextDeviceId } }
          : { facingMode: { ideal: "environment" } };
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
        if (runId !== runRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const videoEl = videoRef.current;
        if (!videoEl) {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          return;
        }
        videoEl.srcObject = stream;
        await videoEl.play();
        if (runId !== runRef.current) return;

        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings?.() || {};
        setFacingUser(settings.facingMode === "user");
        if (settings.deviceId) setDeviceId(settings.deviceId);

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (runId !== runRef.current) return;
        setCameras(devices.filter((device) => device.kind === "videoinput"));

        activeRef.current = true;
        setCameraState("scanning");
        lastScanRef.current = 0;

        const scan = (timestamp) => {
          if (!activeRef.current || runId !== runRef.current) return;
          rafRef.current = requestAnimationFrame(scan);
          if (timestamp - lastScanRef.current < 120) return;
          lastScanRef.current = timestamp;

          const currentVideo = videoRef.current;
          const canvas = canvasRef.current;
          if (!currentVideo || !canvas || currentVideo.readyState < 2) return;
          const vw = currentVideo.videoWidth;
          const vh = currentVideo.videoHeight;
          if (!vw || !vh) return;

          const scale = Math.min(1, 640 / Math.max(vw, vh));
          const w = Math.max(1, Math.round(vw * scale));
          const h = Math.max(1, Math.round(vh * scale));
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          ctx.drawImage(currentVideo, 0, 0, w, h);
          const image = ctx.getImageData(0, 0, w, h);
          const text = decodeQrImageData(image.data, w, h);
          if (!text || !activeRef.current || runId !== runRef.current) return;

          const shot = canvas.toDataURL("image/jpeg", 0.85);
          activeRef.current = false;
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
          streamRef.current?.getTracks().forEach((item) => item.stop());
          streamRef.current = null;
          if (videoRef.current) videoRef.current.srcObject = null;
          setCameraState("stopped");
          pausedRef.current = true;
          publishResult(text, shot);
        };
        rafRef.current = requestAnimationFrame(scan);
      } catch (err) {
        if (runId !== runRef.current) return;
        releaseStream();
        setCameraState("stopped");
        setError(cameraErrorMessage(err));
      }
    },
    [publishResult, releaseStream, replacePreview, stopCamera]
  );

  useEffect(() => {
    if (source !== "webcam") {
      pausedRef.current = false;
      stopCamera();
      return undefined;
    }
    if (!pausedRef.current) startCamera();
    return () => stopCamera();
  }, [source, startCamera, stopCamera]);

  useEffect(() => {
    const onPaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (!file) continue;
        event.preventDefault();
        setSource("upload");
        decodeFile(file);
        return;
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [decodeFile]);

  useEffect(
    () => () => {
      const current = previewRef.current;
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
    },
    []
  );

  const pasteFromClipboard = async () => {
    setError(null);
    if (!navigator.clipboard?.read) {
      setError("This browser cannot read clipboard images from a button. Press Ctrl+V or Cmd+V instead.");
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((entry) => entry.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        const file = new File([blob], "clipboard-image", { type });
        setSource("upload");
        await decodeFile(file);
        return;
      }
      setError("No image on the clipboard. Copy a QR image, then paste again.");
    } catch (err) {
      const denied = err?.name === "NotAllowedError" || err?.name === "SecurityError";
      setError(
        denied
          ? "Clipboard access was blocked. Press Ctrl+V or Cmd+V to paste the image."
          : "Could not read the clipboard. Press Ctrl+V or Cmd+V to paste the image."
      );
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    setSource("upload");
    decodeFile(file);
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const index = cameras.findIndex((camera) => camera.deviceId === deviceId);
    const next = cameras[(index + 1) % cameras.length];
    if (next?.deviceId) startCamera(next.deviceId);
  };

  const info = contents ? describeQr(contents) : null;
  const showVideo = cameraState === "starting" || cameraState === "scanning";

  return (
    <div
      className="space-y-6"
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
        {SOURCES.map((item) => {
          const Icon = item.icon;
          const selected = source === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSource(item.id)}
              aria-pressed={selected}
              className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
                selected
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <Icon size={14} weight="thin" />
              {item.label}
            </button>
          );
        })}
      </div>

      {source === "upload" && (
        <div
          className={`border-2 border-dashed p-12 text-center transition-colors ${
            dragOver
              ? "border-stone-500 bg-stone-100/50 dark:bg-stone-900/50"
              : "border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500"
          }`}
        >
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) decodeFile(file);
              event.target.value = "";
            }}
          />
          <label htmlFor={fileInputId} className="cursor-pointer flex flex-col items-center gap-3">
            <UploadSimple size={48} weight="thin" className="text-stone-400" />
            <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
              Drop a QR image here, or click to browse
            </span>
            <span className="font-mono text-[11px] text-stone-400">
              PNG, JPG, WebP, SVG. You can also paste with Ctrl+V or Cmd+V.
            </span>
          </label>
        </div>
      )}

      {source === "clipboard" && (
        <div
          className={`border-2 border-dashed p-12 text-center space-y-4 transition-colors ${
            dragOver
              ? "border-stone-500 bg-stone-100/50 dark:bg-stone-900/50"
              : "border-stone-300 dark:border-stone-600"
          }`}
        >
          <ClipboardText size={48} weight="thin" className="mx-auto text-stone-400" />
          <p className="font-mono text-sm text-stone-600 dark:text-stone-300">
            Copy a QR image, then paste it here with Ctrl+V or Cmd+V.
          </p>
          <div className="flex justify-center">
            <Button onClick={pasteFromClipboard} variant="secondary" icon={ClipboardText}>
              Paste from clipboard
            </Button>
          </div>
        </div>
      )}

      {source === "webcam" && (
        <div className="space-y-3">
          <div
            className={`relative border border-stone-200 dark:border-stone-700 min-h-[220px] flex items-center justify-center overflow-hidden ${
              showVideo ? "bg-stone-950" : "bg-stone-100 dark:bg-stone-950"
            }`}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={`w-full max-h-[22rem] object-contain ${facingUser ? "-scale-x-100" : ""} ${
                showVideo ? "block" : "hidden"
              }`}
            />
            {cameraState === "starting" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs text-stone-200">Starting camera…</span>
              </div>
            )}
            {cameraState === "scanning" && (
              <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                <span className="inline-block px-3 py-1 bg-stone-900/80 text-stone-50 font-mono text-[11px]">
                  Point the camera at a QR code
                </span>
              </div>
            )}
            {!showVideo && preview && (
              <img
                src={preview}
                alt="Frame captured from the camera"
                className="w-full max-h-[22rem] object-contain bg-white"
              />
            )}
            {!showVideo && !preview && (
              <span className="font-mono text-sm text-stone-400 px-6 text-center">
                Camera is off.
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {cameraState === "scanning" || cameraState === "starting" ? (
              <Button
                onClick={() => {
                  pausedRef.current = true;
                  stopCamera();
                }}
                variant="outline"
                icon={CameraSlash}
              >
                Stop
              </Button>
            ) : (
              <Button onClick={() => startCamera(deviceId || undefined)} icon={Camera}>
                {contents ? "Scan again" : "Start camera"}
              </Button>
            )}
            {cameras.length > 1 && (
              <Button onClick={switchCamera} variant="secondary" icon={CameraRotate}>
                Switch camera
              </Button>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {busy && (
        <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm font-mono text-stone-500">
          Reading QR code…
        </div>
      )}

      {error && (
        <div className="space-y-3">
          {preview && !contents && (
            <div className="w-28 h-28 border border-stone-200 dark:border-stone-700 bg-white overflow-hidden">
              <img src={preview} alt="Image that was scanned" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        </div>
      )}

      {contents && info && (
        <div className="space-y-4 border border-stone-200 dark:border-stone-700 p-4">
          <div className="flex items-start gap-4">
            {preview && (
              <div className="w-28 h-28 border border-stone-200 dark:border-stone-700 bg-white shrink-0 overflow-hidden">
                <img src={preview} alt="QR code that was read" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                {KIND_LABEL[info.kind] || "Text"}
              </div>
              {info.kind === "wifi" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Network" value={info.wifi.ssid || "—"} />
                  <Field label="Security" value={info.wifi.authLabel} />
                  <Field label="Password" value={info.wifi.password || "None"} />
                  {info.wifi.hidden && <Field label="Hidden" value="Yes" />}
                </div>
              )}
              {info.kind === "vcard" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" value={info.vcard.name} />
                  <Field label="Phone" value={info.vcard.phone} />
                  <Field label="Email" value={info.vcard.email} />
                  <Field label="Organization" value={info.vcard.org} />
                  <Field label="Address" value={info.vcard.address} />
                </div>
              )}
              {info.kind === "link" && (
                <a
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs transition-colors"
                >
                  <ArrowSquareOut size={16} weight="thin" />
                  Open
                </a>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Contents
            </div>
            <div className="relative">
              <pre className="w-full max-h-64 overflow-auto bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 p-4 pr-14 text-sm font-mono text-stone-800 dark:text-stone-100 whitespace-pre-wrap break-all">
                {contents}
              </pre>
              <CopyButton
                text={contents}
                onCopySuccess={() => onToastRef.current?.("Copied!")}
                className="absolute right-2 top-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
