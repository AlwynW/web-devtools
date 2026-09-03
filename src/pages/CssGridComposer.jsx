import { useMemo, useState } from "react";
import CopyPre from "../components/CopyPre";
import {
  buildComposerCss,
  composeGridModel,
  previewStyles,
  subCellSize,
  clamp,
} from "../utils/cssGridComposer";

const inputClass =
  "w-full p-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100";
const labelClass =
  "block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1";

const DIST_MIN = 1;
const DIST_MAX = 400;

const DEFAULT_MAJOR = {
  color: "#a8a29e",
  opacity: 0.9,
  width: 1.5,
  style: "solid",
};

const DEFAULT_SUB = {
  color: "#78716c",
  opacity: 0.45,
  width: 1,
  style: "solid",
};

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function LineStyleControls({ title, value, onChange }) {
  return (
    <div className="space-y-3 border border-stone-200 dark:border-stone-800 p-4">
      <p className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Style">
          <select
            value={value.style}
            onChange={(e) => onChange({ ...value, style: e.target.value })}
            className={inputClass}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </Field>
        <Field label="Color">
          <input
            type="color"
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            className="h-10 w-full cursor-pointer border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
          />
        </Field>
        <Field label={`Width (${value.width}px)`}>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={value.width}
            onChange={(e) => onChange({ ...value, width: +e.target.value })}
            className="w-full"
          />
        </Field>
        <Field label={`Opacity (${Math.round(value.opacity * 100)}%)`}>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={value.opacity}
            onChange={(e) => onChange({ ...value, opacity: +e.target.value })}
            className="w-full"
          />
        </Field>
      </div>
    </div>
  );
}

export default function CssGridComposer({ onToast }) {
  const [distanceX, setDistanceX] = useState(50);
  const [distanceY, setDistanceY] = useState(50);
  const [linkAxes, setLinkAxes] = useState(true);

  const [subEnabled, setSubEnabled] = useState(true);
  const [subdivisionsX, setSubdivisionsX] = useState(5);
  const [subdivisionsY, setSubdivisionsY] = useState(5);
  const [linkSub, setLinkSub] = useState(true);

  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [sub, setSub] = useState(DEFAULT_SUB);

  const [enable3d, setEnable3d] = useState(false);
  const [rotateX, setRotateX] = useState(55);
  const [rotateY, setRotateY] = useState(0);
  const [rotateZ, setRotateZ] = useState(0);

  const [perspective, setPerspective] = useState(900);
  const [originX, setOriginX] = useState(50);
  const [originY, setOriginY] = useState(40);

  const [bgColor, setBgColor] = useState("#1c1917");
  const [showVanishing, setShowVanishing] = useState(true);

  const setMajorX = (v) => {
    const n = clamp(Math.round(Number(v) || 1), DIST_MIN, DIST_MAX);
    setDistanceX(n);
    if (linkAxes) setDistanceY(n);
  };

  const setMajorY = (v) => {
    const n = clamp(Math.round(Number(v) || 1), DIST_MIN, DIST_MAX);
    setDistanceY(n);
    if (linkAxes) setDistanceX(n);
  };

  const setDivX = (v) => {
    const n = clamp(Math.round(v) || 2, 2, 20);
    setSubdivisionsX(n);
    if (linkSub) setSubdivisionsY(n);
  };

  const setDivY = (v) => {
    const n = clamp(Math.round(v) || 2, 2, 20);
    setSubdivisionsY(n);
    if (linkSub) setSubdivisionsX(n);
  };

  const model = useMemo(
    () =>
      composeGridModel({
        majorX: distanceX,
        majorY: distanceY,
        subEnabled,
        subdivisionsX,
        subdivisionsY,
        major,
        sub,
      }),
    [
      distanceX,
      distanceY,
      subEnabled,
      subdivisionsX,
      subdivisionsY,
      major,
      sub,
    ],
  );

  const cssOutput = useMemo(
    () =>
      buildComposerCss({
        bgColor,
        model,
        enable3d,
        perspective,
        originX,
        originY,
        rotateX,
        rotateY,
        rotateZ,
      }),
    [
      bgColor,
      model,
      enable3d,
      perspective,
      originX,
      originY,
      rotateX,
      rotateY,
      rotateZ,
    ],
  );

  const {
    plane: planeStyle,
    vertical: verticalStyle,
    horizontal: horizontalStyle,
  } = useMemo(
    () =>
      previewStyles(model, {
        enable3d,
        rotateX,
        rotateY,
        rotateZ,
      }),
    [model, enable3d, rotateX, rotateY, rotateZ],
  );

  const subPxX = subCellSize(distanceX, subdivisionsX);
  const subPxY = subCellSize(distanceY, subdivisionsY);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Grid Composer
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Perspective grids via repeating-linear-gradient and CSS transforms.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6 font-mono text-sm">
        {/* Preview: clip shell → perspective scene → transformed plane */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className={labelClass + " mb-0"}>Preview</label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[11px] text-stone-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enable3d}
                  onChange={(e) => setEnable3d(e.target.checked)}
                />
                3D transform
              </label>
              {enable3d && (
                <label className="flex items-center gap-2 text-[11px] text-stone-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVanishing}
                    onChange={(e) => setShowVanishing(e.target.checked)}
                  />
                  Show vanishing point
                </label>
              )}
            </div>
          </div>
          <div
            className="relative h-72 sm:h-96 border border-stone-300 dark:border-stone-700 overflow-hidden isolate"
            style={{ background: bgColor }}
          >
            <div
              className="absolute inset-0 overflow-hidden"
              style={
                enable3d
                  ? {
                      perspective: `${perspective}px`,
                      perspectiveOrigin: `${originX}% ${originY}%`,
                    }
                  : undefined
              }
            >
              <div style={planeStyle} aria-hidden>
                {verticalStyle && <div style={verticalStyle} />}
                {horizontalStyle && <div style={horizontalStyle} />}
              </div>
            </div>
            {enable3d && showVanishing && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${originX}%`, top: `${originY}%` }}
                title="Perspective origin"
              >
                <div className="relative h-5 w-5">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-amber-400/90" />
                  <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-amber-400/90" />
                  <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 bg-amber-500/40" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-stone-500 uppercase tracking-[0.18em]">
              Distance
            </p>
            <label className="flex items-center gap-2 text-[11px] text-stone-500 cursor-pointer">
              <input
                type="checkbox"
                checked={linkAxes}
                onChange={(e) => {
                  setLinkAxes(e.target.checked);
                  if (e.target.checked) setDistanceY(distanceX);
                }}
              />
              Link X / Y
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={`X (${distanceX}px)`}>
              <input
                type="range"
                min={DIST_MIN}
                max={DIST_MAX}
                value={distanceX}
                onChange={(e) => setMajorX(+e.target.value)}
                className="w-full"
              />
              <input
                type="number"
                min={DIST_MIN}
                max={DIST_MAX}
                value={distanceX}
                onChange={(e) => setMajorX(+e.target.value)}
                className={`${inputClass} mt-2`}
              />
            </Field>
            <Field label={`Y (${distanceY}px)`}>
              <input
                type="range"
                min={DIST_MIN}
                max={DIST_MAX}
                value={distanceY}
                onChange={(e) => setMajorY(+e.target.value)}
                className="w-full"
                disabled={linkAxes}
              />
              <input
                type="number"
                min={DIST_MIN}
                max={DIST_MAX}
                value={distanceY}
                onChange={(e) => setMajorY(+e.target.value)}
                className={`${inputClass} mt-2`}
                disabled={linkAxes}
              />
            </Field>
          </div>
        </div>

        {/* Subgrid — subdivisions per major cell */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-[11px] text-stone-500 uppercase tracking-[0.18em] cursor-pointer">
              <input
                type="checkbox"
                checked={subEnabled}
                onChange={(e) => setSubEnabled(e.target.checked)}
              />
              Subgrid
            </label>
            {subEnabled && (
              <label className="flex items-center gap-2 text-[11px] text-stone-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkSub}
                  onChange={(e) => {
                    setLinkSub(e.target.checked);
                    if (e.target.checked) setSubdivisionsY(subdivisionsX);
                  }}
                />
                Link X / Y
              </label>
            )}
          </div>
          {subEnabled && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label={`Subdivisions X (${subdivisionsX} → ${subPxX.toFixed(1)}px)`}
              >
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={subdivisionsX}
                  onChange={(e) => setDivX(+e.target.value)}
                  className="w-full"
                />
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="1"
                  value={subdivisionsX}
                  onChange={(e) => setDivX(+e.target.value)}
                  className={`${inputClass} mt-2`}
                />
              </Field>
              <Field
                label={`Subdivisions Y (${subdivisionsY} → ${subPxY.toFixed(1)}px)`}
              >
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={subdivisionsY}
                  onChange={(e) => setDivY(+e.target.value)}
                  className="w-full"
                  disabled={linkSub}
                />
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="1"
                  value={subdivisionsY}
                  onChange={(e) => setDivY(+e.target.value)}
                  className={`${inputClass} mt-2`}
                  disabled={linkSub}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Line styles */}
        <div className="grid md:grid-cols-2 gap-4">
          <LineStyleControls
            title="Major grid lines"
            value={major}
            onChange={setMajor}
          />
          <LineStyleControls
            title="Subgrid lines"
            value={sub}
            onChange={setSub}
          />
        </div>

        {/* 3D angle + perspective (optional) */}
        {enable3d && (
          <>
            <div className="space-y-3">
              <p className="text-[11px] text-stone-500 uppercase tracking-[0.18em]">
                3D angle
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={`rotateX (${rotateX}°)`}>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={rotateX}
                    onChange={(e) => setRotateX(+e.target.value)}
                    className="w-full"
                  />
                </Field>
                <Field label={`rotateY (${rotateY}°)`}>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={rotateY}
                    onChange={(e) => setRotateY(+e.target.value)}
                    className="w-full"
                  />
                </Field>
                <Field label={`rotateZ (${rotateZ}°)`}>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotateZ}
                    onChange={(e) => setRotateZ(+e.target.value)}
                    className="w-full"
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-stone-500 uppercase tracking-[0.18em]">
                Perspective point
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={`Distance (${perspective}px)`}>
                  <input
                    type="range"
                    min="200"
                    max="2400"
                    step="20"
                    value={perspective}
                    onChange={(e) => setPerspective(+e.target.value)}
                    className="w-full"
                  />
                </Field>
                <Field label={`Origin X (${originX}%)`}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={originX}
                    onChange={(e) => setOriginX(+e.target.value)}
                    className="w-full"
                  />
                </Field>
                <Field label={`Origin Y (${originY}%)`}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={originY}
                    onChange={(e) => setOriginY(+e.target.value)}
                    className="w-full"
                  />
                </Field>
              </div>
            </div>
          </>
        )}

        <Field label="Background">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-10 w-24 cursor-pointer border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
          />
        </Field>

        <div>
          <label className={labelClass}>CSS</label>
          <CopyPre
            text={cssOutput}
            onCopySuccess={() => onToast?.("Copied!")}
            className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 max-h-72 overflow-auto"
            preClassName="p-4 text-stone-800 dark:text-stone-200 text-xs whitespace-pre-wrap break-all"
          />
        </div>
      </div>
    </div>
  );
}
