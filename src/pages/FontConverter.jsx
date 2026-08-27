import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DotsSixVertical,
  DownloadSimple,
  Plus,
  Trash,
  UploadSimple,
  WarningCircle,
  X,
} from "phosphor-react";
import JSZip from "jszip";
import Button from "../components/Button";
import CopyPre from "../components/CopyPre";
import { convertSfnt, flavorExtension } from "../utils/fontSfnt";
import {
  STYLE_OPTIONS,
  WEIGHT_OPTIONS,
  assignFacesToFamilies,
  buildKitCss,
  buildKitFileMap,
  buildKitPreviewHtml,
  duplicateFaceKeys,
  formatBytes,
  groupFacesIntoFamilies,
  isFontFile,
  loadFontFile,
  quoteFontFamily,
  sortFaceIds,
} from "../utils/fontMeta";

const INPUT_CLASS =
  "w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100";

const LABEL_CLASS =
  "block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2";

const SELECT_CLASS =
  "px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100";

const FACE_DRAG = "devkit-face:";
const PREVIEW_FAMILY_PREFIX = "dk-face-";

const DISPLAY_OPTIONS = ["swap", "optional", "fallback", "block", "auto"];
const SAMPLE_PRESETS = [
  "The quick brown fox jumps over the lazy dog",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz 0123456789",
  "Hamburgefonstiv",
];

function createEmptyFamily(name = "Family 1") {
  return { id: crypto.randomUUID(), name, faceIds: [] };
}

function isFileDrag(event) {
  return Array.from(event.dataTransfer?.types || []).includes("Files");
}

function dragLeft(event) {
  return !event.currentTarget.contains(event.relatedTarget);
}

function LicenseNotice({ count, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const many = count > 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="font-license-title"
        className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-full max-w-md shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-5 py-4 border-b border-stone-200 dark:border-stone-800">
          <WarningCircle
            size={22}
            weight="thin"
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <div className="min-w-0 flex-1">
            <h3
              id="font-license-title"
              className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100"
            >
              {many
                ? "You need the rights to use these fonts"
                : "You need the rights to use this font"}
            </h3>
            <p className="mt-2 font-mono text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Conversion happens in your browser and does not grant a license.
              Only continue if you own {many ? "these files" : "this file"} or
              your license allows converting, embedding, and redistributing{" "}
              {many ? "them" : "it"}.
            </p>
          </div>
        </div>
        <div className="flex justify-end px-5 py-3">
          <Button onClick={onClose}>I understand</Button>
        </div>
      </div>
    </div>
  );
}

function FaceCard({
  face,
  duplicate,
  onChange,
  onRemove,
  onDragStart,
  removeTitle = "Remove font",
}) {
  return (
    <div
      className={`p-3 border bg-white dark:bg-stone-900 ${
        duplicate
          ? "border-amber-400 dark:border-amber-600"
          : "border-stone-200 dark:border-stone-700"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          draggable
          onDragStart={(event) => onDragStart(event, face.id)}
          className="mt-0.5 shrink-0 text-stone-400 cursor-grab active:cursor-grabbing"
          title="Drag to another family"
        >
          <DotsSixVertical size={18} weight="thin" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-sm truncate text-stone-800 dark:text-stone-200">
                {face.fileName}
              </div>
              <div className="text-[10px] font-mono text-stone-500">
                {face.sourceFormat.toUpperCase()}
                {face.flavor !== face.sourceFormat
                  ? ` → ${face.flavor.toUpperCase()}`
                  : ""}
                {" · "}
                {formatBytes(face.byteLength)}
                {face.glyphCount != null ? ` · ${face.glyphCount} glyphs` : ""}
                {face.isVariable ? " · variable" : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(face.id)}
              className="p-1 text-stone-400 hover:text-red-600"
              title={removeTitle}
            >
              <X size={14} weight="thin" />
            </button>
          </div>

          {face.isVariable && (
            <label className="flex items-center gap-2 font-mono text-[11px] text-stone-600 dark:text-stone-300">
              <input
                type="checkbox"
                checked={face.useRange}
                onChange={(event) =>
                  onChange(face.id, { useRange: event.target.checked })
                }
              />
              Variable weight range
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            {face.useRange ? (
              <>
                <label className="flex items-center gap-1 font-mono text-[10px] text-stone-500">
                  Min
                  <input
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={face.weightMin}
                    onChange={(event) =>
                      onChange(face.id, {
                        weightMin: Number(event.target.value) || 100,
                      })
                    }
                    className={`${SELECT_CLASS} w-20`}
                  />
                </label>
                <label className="flex items-center gap-1 font-mono text-[10px] text-stone-500">
                  Max
                  <input
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={face.weightMax}
                    onChange={(event) =>
                      onChange(face.id, {
                        weightMax: Number(event.target.value) || 900,
                      })
                    }
                    className={`${SELECT_CLASS} w-20`}
                  />
                </label>
              </>
            ) : (
              <select
                value={face.weight}
                onChange={(event) =>
                  onChange(face.id, { weight: Number(event.target.value) })
                }
                className={SELECT_CLASS}
              >
                {WEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <select
              value={face.style}
              onChange={(event) => onChange(face.id, { style: event.target.value })}
              className={SELECT_CLASS}
            >
              {STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FontConverter({ onToast }) {
  const [faces, setFaces] = useState([]);
  const [families, setFamilies] = useState(() => [createEmptyFamily()]);
  const [fileOver, setFileOver] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);
  const [formats, setFormats] = useState(() => new Set(["woff2", "woff"]));
  const [display, setDisplay] = useState("swap");
  const [urlPrefix, setUrlPrefix] = useState("fonts/");
  const [sample, setSample] = useState(SAMPLE_PRESETS[0]);
  const [previewSize, setPreviewSize] = useState(32);
  const [previewFamilyId, setPreviewFamilyId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [licenseCount, setLicenseCount] = useState(1);
  const dragFaceIdRef = useRef(null);
  const fileInputRef = useRef(null);

  const facesById = useMemo(() => new Map(faces.map((face) => [face.id, face])), [faces]);

  const assigned = useMemo(() => {
    const ids = new Set();
    for (const family of families) {
      for (const id of family.faceIds) ids.add(id);
    }
    return ids;
  }, [families]);

  const unassigned = faces.filter((face) => !assigned.has(face.id));

  const faceFiles = useMemo(
    () => buildKitFileMap(families, facesById),
    [families, facesById],
  );

  const formatList = useMemo(() => {
    const order = ["woff2", "woff", "original"];
    return order.filter((fmt) => formats.has(fmt));
  }, [formats]);

  const css = useMemo(
    () =>
      buildKitCss({
        families,
        facesById,
        faceFiles,
        formats: formatList,
        display,
        urlPrefix,
      }),
    [families, facesById, faceFiles, formatList, display, urlPrefix],
  );

  const previewFamilyIdSafe = families.some((family) => family.id === previewFamilyId)
    ? previewFamilyId
    : families[0]?.id ?? null;
  const previewFamily =
    families.find(
      (family) => family.id === previewFamilyIdSafe && family.faceIds.length,
    ) || families.find((family) => family.faceIds.length) || null;

  useEffect(() => {
    const loaded = [];
    let cancelled = false;

    (async () => {
      for (const face of faces) {
        const unique = new FontFace(
          `${PREVIEW_FAMILY_PREFIX}${face.id}`,
          face.sfnt.slice(0),
        );
        try {
          await unique.load();
          if (cancelled) {
            document.fonts.delete(unique);
            continue;
          }
          document.fonts.add(unique);
          loaded.push(unique);
        } catch {
          /* preview-only */
        }
        const family = families.find((item) => item.faceIds.includes(face.id));
        if (!family) continue;
        const descriptors = {
          style: face.style,
          weight: face.useRange
            ? `${face.weightMin} ${face.weightMax}`
            : String(face.weight),
          display: "swap",
        };
        const shared = new FontFace(
          `${PREVIEW_FAMILY_PREFIX}fam-${family.id}`,
          face.sfnt.slice(0),
          descriptors,
        );
        try {
          await shared.load();
          if (cancelled) {
            document.fonts.delete(shared);
            continue;
          }
          document.fonts.add(shared);
          loaded.push(shared);
        } catch {
          /* preview-only */
        }
      }
    })();

    return () => {
      cancelled = true;
      loaded.forEach((face) => document.fonts.delete(face));
    };
  }, [faces, families]);

  const updateFace = (id, patch) => {
    setFaces((prev) => prev.map((face) => (face.id === id ? { ...face, ...patch } : face)));
  };

  const removeFace = (id) => {
    setFaces((prev) => prev.filter((face) => face.id !== id));
    setFamilies((prev) =>
      prev.map((family) => ({
        ...family,
        faceIds: family.faceIds.filter((faceId) => faceId !== id),
      })),
    );
  };

  const moveFace = (faceId, familyId) => {
    setFamilies((prev) =>
      prev.map((family) => {
        const without = family.faceIds.filter((id) => id !== faceId);
        if (!familyId || family.id !== familyId) return { ...family, faceIds: without };
        return { ...family, faceIds: [...without, faceId] };
      }),
    );
  };

  const addFamily = () => {
    const family = {
      id: crypto.randomUUID(),
      name: `Family ${families.length + 1}`,
      faceIds: [],
    };
    setFamilies((prev) => [...prev, family]);
    setPreviewFamilyId(family.id);
  };

  const renameFamily = (id, name) => {
    setFamilies((prev) =>
      prev.map((family) => (family.id === id ? { ...family, name } : family)),
    );
  };

  const removeFamily = (id) => {
    setFamilies((prev) => {
      if (prev.length <= 1) {
        return prev.map((family) =>
          family.id === id ? { ...family, faceIds: [] } : family,
        );
      }
      return prev.filter((family) => family.id !== id);
    });
  };

  const addFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []).filter(isFontFile);
      if (!files.length) {
        onToast?.("Drop TTF, OTF, WOFF, or WOFF2 files.");
        return;
      }
      setBusy(true);
      const loaded = [];
      const errors = [];
      for (const file of files) {
        try {
          loaded.push(await loadFontFile(file));
        } catch (err) {
          errors.push(`${file.name}: ${err.message || "could not parse"}`);
        }
      }
      if (loaded.length) {
        setFaces((prev) => [...prev, ...loaded]);
        setFamilies((prev) => {
          const grouped = groupFacesIntoFamilies(loaded);
          const soleEmpty = prev.length === 1 && prev[0].faceIds.length === 0;
          if (soleEmpty && grouped.length) {
            const [first, ...rest] = grouped;
            return [{ ...prev[0], name: first.name, faceIds: first.faceIds }, ...rest];
          }
          if (!prev.length) return grouped;
          return assignFacesToFamilies(prev, loaded);
        });
        setLicenseCount(loaded.length);
        setLicenseOpen(true);
        onToast?.(
          loaded.length === 1 ? "Added 1 font." : `Added ${loaded.length} fonts.`,
        );
      }
      if (errors.length) onToast?.(errors[0]);
      setBusy(false);
    },
    [onToast],
  );

  const onDragStartFace = (event, id) => {
    dragFaceIdRef.current = id;
    event.dataTransfer.setData("text/plain", `${FACE_DRAG}${id}`);
    event.dataTransfer.effectAllowed = "move";
  };

  const dropFaceOn = (familyId) => {
    const id = dragFaceIdRef.current;
    dragFaceIdRef.current = null;
    setDropTarget(null);
    if (!id) return;
    moveFace(id, familyId);
  };

  const handleZoneDragOver = (event, key) => {
    if (isFileDrag(event)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "none";
      return;
    }
    if (dragFaceIdRef.current) {
      event.preventDefault();
      setDropTarget(key);
    }
  };

  const handleZoneDrop = (event, familyId) => {
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(null);
    if (isFileDrag(event)) return;
    dropFaceOn(familyId);
  };

  const toggleFormat = (fmt) => {
    setFormats((prev) => {
      const next = new Set(prev);
      if (next.has(fmt)) next.delete(fmt);
      else next.add(fmt);
      return next;
    });
  };

  const clearAll = () => {
    setFaces([]);
    setFamilies([createEmptyFamily()]);
    setPreviewFamilyId(null);
    onToast?.("Cleared.");
  };

  const assignedFaces = () =>
    families.flatMap((family) =>
      sortFaceIds(family.faceIds, facesById)
        .map((id) => facesById.get(id))
        .filter(Boolean),
    );

  const addConvertedFonts = async (target) => {
    for (const family of families) {
      for (const id of sortFaceIds(family.faceIds, facesById)) {
        const face = facesById.get(id);
        const base = faceFiles.get(id);
        if (!face || !base) continue;
        if (formatList.includes("woff2")) {
          target.file(`${base}.woff2`, await convertSfnt(face.sfnt, "woff2"));
        }
        if (formatList.includes("woff")) {
          target.file(`${base}.woff`, await convertSfnt(face.sfnt, "woff"));
        }
        if (formatList.includes("original")) {
          const ext = flavorExtension(face.flavor);
          target.file(`${base}.${ext}`, await convertSfnt(face.sfnt, ext));
        }
      }
    }
  };

  const saveBlob = (blob, filename) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadZip = async (kind) => {
    if (!formatList.length) {
      onToast?.("Choose at least one output format.");
      return;
    }
    if (!assignedFaces().length) {
      onToast?.("Put at least one font in a family.");
      return;
    }
    setZipping(kind);
    try {
      const zip = new JSZip();
      if (kind === "kit") {
        zip.file(
          "fonts.css",
          buildKitCss({
            families,
            facesById,
            faceFiles,
            formats: formatList,
            display,
            urlPrefix: "fonts/",
          }),
        );
        zip.file("preview.html", buildKitPreviewHtml({ families, facesById }));
        const folder = zip.folder("fonts");
        await addConvertedFonts(folder);
        saveBlob(await zip.generateAsync({ type: "blob" }), "font-kit.zip");
      } else {
        await addConvertedFonts(zip);
        saveBlob(await zip.generateAsync({ type: "blob" }), "fonts.zip");
      }
      onToast?.("ZIP downloaded.");
    } catch (err) {
      onToast?.(err.message || "Conversion failed.");
    } finally {
      setZipping(false);
    }
  };

  const zoneClass = (key) =>
    `min-h-[4.5rem] flex-1 p-3 border-2 border-dashed transition-colors space-y-2 ${
      dropTarget === key
        ? "border-stone-700 bg-stone-100/70 dark:border-stone-300 dark:bg-stone-800/40"
        : "border-stone-300 dark:border-stone-600"
    }`;

  return (
    <>
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Font Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert TTF, OTF, WOFF, and WOFF2 in the browser. Group families, set
          weights, preview, and copy @font-face CSS.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-8">
        <div
          onDragOver={(event) => {
            if (!isFileDrag(event)) return;
            event.preventDefault();
            setFileOver(true);
          }}
          onDragLeave={(event) => {
            if (dragLeft(event)) setFileOver(false);
          }}
          onDrop={(event) => {
            if (!isFileDrag(event)) return;
            event.preventDefault();
            setFileOver(false);
            addFiles(event.dataTransfer.files);
          }}
          className={`border-2 border-dashed p-10 text-center transition-colors ${
            fileOver
              ? "border-stone-500 bg-stone-100/50 dark:bg-stone-800/40"
              : "border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer flex flex-col items-center gap-3 w-full"
          >
            <UploadSimple size={48} weight="thin" className="text-stone-400" />
            <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
              {busy
                ? "Reading fonts…"
                : "Drop font files here or click to browse"}
            </span>
            <span className="font-mono text-[11px] text-stone-400">
              TTF, OTF, WOFF, WOFF2 · files stay in this browser
            </span>
          </button>
        </div>

        <>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={addFamily} icon={Plus} variant="secondary">
                Add family
              </Button>
              <Button
                onClick={() => {
                  const grouped = groupFacesIntoFamilies(faces);
                  setFamilies(grouped.length ? grouped : [createEmptyFamily()]);
                }}
                variant="outline"
              >
                Regroup by name
              </Button>
              <Button onClick={clearAll} variant="outline" icon={Trash}>
                Clear
              </Button>
              <span className="font-mono text-[11px] text-stone-500 ml-auto">
                {faces.length} font{faces.length === 1 ? "" : "s"} · check the
                license before converting
              </span>
            </div>

            {unassigned.length > 0 && (
              <section>
                <label className={LABEL_CLASS}>
                  Unassigned ({unassigned.length})
                </label>
                <div
                  onDragOver={(event) =>
                    handleZoneDragOver(event, "unassigned")
                  }
                  onDragLeave={(event) => {
                    if (dragLeft(event)) setDropTarget(null);
                  }}
                  onDrop={(event) => handleZoneDrop(event, null)}
                  className={zoneClass("unassigned")}
                >
                  <div className="grid sm:grid-cols-2 gap-2">
                    {unassigned.map((face) => (
                      <FaceCard
                        key={face.id}
                        face={face}
                        duplicate={false}
                        onChange={updateFace}
                        onRemove={removeFace}
                        onDragStart={onDragStartFace}
                        removeTitle="Delete font"
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div className="grid md:grid-cols-2 gap-4 items-stretch">
              {families.map((family) => {
                const dups = duplicateFaceKeys(family, facesById);
                const ordered = sortFaceIds(family.faceIds, facesById);
                return (
                  <section key={family.id} className="flex flex-col min-w-0">
                    <div className="flex items-end gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <label className={LABEL_CLASS}>Family name</label>
                        <input
                          value={family.name}
                          onChange={(event) =>
                            renameFamily(family.id, event.target.value)
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      {families.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFamily(family.id)}
                          className="mb-[1px] p-2 border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-red-600"
                          title="Remove family (fonts become unassigned)"
                        >
                          <Trash size={16} weight="thin" />
                        </button>
                      )}
                    </div>
                    {dups.size > 0 && (
                      <p className="mb-2 font-mono text-[11px] text-amber-700 dark:text-amber-400">
                        Two faces share the same weight and style.
                      </p>
                    )}
                    <div
                      onDragOver={(event) =>
                        handleZoneDragOver(event, family.id)
                      }
                      onDragLeave={(event) => {
                        if (dragLeft(event)) setDropTarget(null);
                      }}
                      onDrop={(event) => handleZoneDrop(event, family.id)}
                      className={zoneClass(family.id)}
                    >
                      {ordered.length === 0 && (
                        <p className="font-mono text-[11px] text-stone-400 text-center py-4">
                          Drag fonts into this family
                        </p>
                      )}
                      {ordered.map((id) => {
                        const face = facesById.get(id);
                        if (!face) return null;
                        return (
                          <FaceCard
                            key={face.id}
                            face={face}
                            duplicate={dups.has(face.id)}
                            onChange={updateFace}
                            onRemove={moveFace}
                            onDragStart={onDragStartFace}
                            removeTitle="Remove from family"
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {previewFamily && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[12rem]">
                    <label className={LABEL_CLASS}>Preview family</label>
                    <select
                      value={previewFamilyIdSafe}
                      onChange={(event) => setPreviewFamilyId(event.target.value)}
                      className={INPUT_CLASS}
                    >
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name || "Untitled"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[12rem]">
                    <label className={LABEL_CLASS}>Sample</label>
                    <input
                      value={sample}
                      onChange={(event) => setSample(event.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="w-40">
                    <label className={LABEL_CLASS}>Size {previewSize}px</label>
                    <input
                      type="range"
                      min={12}
                      max={96}
                      value={previewSize}
                      onChange={(event) =>
                        setPreviewSize(Number(event.target.value))
                      }
                      className="w-full h-2 bg-stone-200 dark:bg-stone-700 appearance-none cursor-pointer accent-stone-800 dark:accent-stone-200"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSample(preset)}
                      className="px-2 py-1 font-mono text-[10px] border border-stone-300 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      {preset.length > 24 ? `${preset.slice(0, 22)}…` : preset}
                    </button>
                  ))}
                </div>

                <div className="border border-stone-200 dark:border-stone-700 divide-y divide-stone-200 dark:divide-stone-800">
                  {sortFaceIds(previewFamily.faceIds, facesById).map((id) => {
                    const face = facesById.get(id);
                    if (!face) return null;
                    return (
                      <div key={id} className="p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-2">
                          {face.fileName}
                          {" · "}
                          {face.useRange
                            ? `${face.weightMin}–${face.weightMax}`
                            : face.weight}{" "}
                          {face.style}
                        </div>
                        <p
                          className="text-stone-900 dark:text-stone-50 break-words"
                          style={{
                            fontFamily: quoteFontFamily(
                              `${PREVIEW_FAMILY_PREFIX}${face.id}`,
                            ),
                            fontSize: `${previewSize}px`,
                            lineHeight: 1.3,
                            fontSynthesis: "none",
                          }}
                        >
                          {sample || "Aa"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className={LABEL_CLASS}>Weight ladder</label>
                  <div className="border border-stone-200 dark:border-stone-700 divide-y divide-stone-200 dark:divide-stone-800">
                    {WEIGHT_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-baseline gap-4 p-3">
                        <span className="w-24 shrink-0 font-mono text-[10px] text-stone-400">
                          {opt.label}
                        </span>
                        <p
                          className="min-w-0 text-stone-900 dark:text-stone-50 break-words"
                          style={{
                            fontFamily: quoteFontFamily(
                              `${PREVIEW_FAMILY_PREFIX}fam-${previewFamily.id}`,
                            ),
                            fontWeight: opt.value,
                            fontSize: `${Math.max(16, previewSize - 8)}px`,
                            lineHeight: 1.3,
                            fontSynthesis: "none",
                          }}
                        >
                          {sample || "Aa"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {faces.length > 0 && (
            <section className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Output formats</label>
                  <div className="space-y-2 font-mono text-sm text-stone-800 dark:text-stone-200">
                    {[
                      ["woff2", "WOFF2"],
                      ["woff", "WOFF"],
                      ["original", "Original TTF/OTF"],
                    ].map(([id, label]) => (
                      <label key={id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formats.has(id)}
                          onChange={() => toggleFormat(id)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLASS}>font-display</label>
                  <select
                    value={display}
                    onChange={(event) => setDisplay(event.target.value)}
                    className={INPUT_CLASS}
                  >
                    {DISPLAY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>CSS url prefix</label>
                  <input
                    value={urlPrefix}
                    onChange={(event) => setUrlPrefix(event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="fonts/"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>@font-face CSS</label>
                <CopyPre
                  text={css}
                  onCopySuccess={() => onToast?.("CSS copied!")}
                  className="max-h-80 overflow-y-auto overflow-x-auto border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950"
                  preClassName="px-4 pb-4 pt-8 font-mono text-xs text-stone-800 dark:text-stone-200 whitespace-pre"
                />
              </div>

              <div className="flex flex-wrap justify-start gap-2">
                <Button
                  onClick={() => downloadZip("fonts")}
                  icon={DownloadSimple}
                  
                  className={zipping ? "opacity-60 pointer-events-none" : ""}
                >
                  {zipping === "fonts" ? "Building ZIP…" : "Download fonts"}
                </Button>
                <Button
                  onClick={() => downloadZip("kit")}
                  icon={DownloadSimple}
                  className={zipping ? "opacity-60 pointer-events-none" : ""}
                >
                  {zipping === "kit" ? "Building ZIP…" : "Download font kit ZIP"}
                </Button>
              </div>
            </section>
            )}
          </>
      </div>
    </div>
    {licenseOpen && (
      <LicenseNotice
        count={licenseCount}
        onClose={() => setLicenseOpen(false)}
      />
    )}
    </>
  );
}
