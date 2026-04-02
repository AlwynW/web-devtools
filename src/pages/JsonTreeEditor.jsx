import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import {
  CaretDown,
  CaretRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash,
  TreeStructure,
} from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import {
  createId,
  jsonValueToTree,
  treeToJsonValue,
  regenerateIds,
  suggestNewPropertyKey,
  emptyPrimitive,
  emptyObject,
  emptyArray,
} from "../utils/jsonTreeEditor";

const inputClass =
  "min-w-0 flex-1 px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400";

const iconBtn =
  "p-1 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors";

const addLinkClass =
  "text-[11px] font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:underline underline-offset-2";

/** @param {{ label: string; onAddPrimitive: () => void; onAddObject: () => void; onAddArray: () => void }} props */
function AddChildRow({ label, onAddPrimitive, onAddObject, onAddArray }) {
  return (
    <div className="pl-1 pt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500 shrink-0">
        {label}
      </span>
      <button type="button" className={addLinkClass} onClick={onAddPrimitive}>
        Add key
      </button>
      <span className="text-stone-300 dark:text-stone-600 select-none" aria-hidden>
        ·
      </span>
      <button type="button" className={addLinkClass} onClick={onAddObject}>
        Add object
      </button>
      <span className="text-stone-300 dark:text-stone-600 select-none" aria-hidden>
        ·
      </span>
      <button type="button" className={addLinkClass} onClick={onAddArray}>
        Add array
      </button>
    </div>
  );
}

/** Same actions for array items: value = primitive entry */
function AddArrayItemRow({ onAddPrimitive, onAddObject, onAddArray }) {
  return (
    <div className="pl-1 pt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500 shrink-0">
        New item
      </span>
      <button type="button" className={addLinkClass} onClick={onAddPrimitive}>
        Add value
      </button>
      <span className="text-stone-300 dark:text-stone-600 select-none" aria-hidden>
        ·
      </span>
      <button type="button" className={addLinkClass} onClick={onAddObject}>
        Add object
      </button>
      <span className="text-stone-300 dark:text-stone-600 select-none" aria-hidden>
        ·
      </span>
      <button type="button" className={addLinkClass} onClick={onAddArray}>
        Add array
      </button>
    </div>
  );
}

function Toolbar({
  collapsed,
  onToggleCollapse,
  canCollapse,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDuplicate,
  onDelete,
  showDelete,
  showDuplicate = true,
  showReorder = true,
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 shrink-0">
      {canCollapse ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className={iconBtn}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <CaretRight size={16} weight="thin" />
          ) : (
            <CaretDown size={16} weight="thin" />
          )}
        </button>
      ) : (
        <span className="w-[26px] shrink-0" aria-hidden />
      )}
      {showReorder ? (
        <>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={iconBtn}
            title="Move up"
          >
            <ArrowUp size={16} weight="thin" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={iconBtn}
            title="Move down"
          >
            <ArrowDown size={16} weight="thin" />
          </button>
        </>
      ) : null}
      {showDuplicate ? (
        <button
          type="button"
          onClick={onDuplicate}
          className={iconBtn}
          title="Duplicate"
        >
          <Copy size={16} weight="thin" />
        </button>
      ) : null}
      {showDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className={iconBtn}
          title="Delete"
        >
          <Trash size={16} weight="thin" />
        </button>
      ) : null}
    </div>
  );
}

function NodeEditor({
  node,
  onChange,
  depth,
  keySlot,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDuplicate,
  onDelete,
  showDelete,
  showDuplicate = true,
  showReorder = true,
}) {
  const nodeRef = useRef(node);
  useLayoutEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const pad = { paddingLeft: Math.min(depth, 12) * 12 };

  if (node.kind === "primitive") {
    return (
      <div className="flex flex-wrap items-start gap-2 py-1.5 border-b border-stone-100 dark:border-stone-800/80" style={pad}>
        <Toolbar
          canCollapse={false}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          showDelete={showDelete}
          showDuplicate={showDuplicate}
          showReorder={showReorder}
        />
        <div className="flex flex-1 min-w-0 gap-2 items-start flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-36 shrink-0">{keySlot}</div>
          <input
            type="text"
            value={node.text}
            onChange={(e) => {
              const n = nodeRef.current;
              if (n.kind !== "primitive") return;
              onChange({ ...n, text: e.target.value });
            }}
            className={inputClass}
            placeholder='e.g. "text", 42, true, null'
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  if (node.kind === "object") {
    const summary = `${node.props.length} key${node.props.length === 1 ? "" : "s"}`;
    return (
      <div className="py-1.5 border-b border-stone-100 dark:border-stone-800/80" style={pad}>
        <div className="flex flex-wrap items-start gap-2">
        <Toolbar
          canCollapse
          collapsed={node.collapsed}
          onToggleCollapse={() => {
            const n = nodeRef.current;
            if (n.kind !== "object") return;
            onChange({ ...n, collapsed: !n.collapsed });
          }}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          showDelete={showDelete}
          showDuplicate={showDuplicate}
          showReorder={showReorder}
        />
        <div className="flex flex-1 min-w-0 gap-2 items-center flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-36 shrink-0">{keySlot}</div>
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            Object · {summary}
          </span>
        </div>
      </div>
        {!node.collapsed && (
          <div className="mt-2 space-y-0 border-l border-stone-200 dark:border-stone-700 ml-1 pl-2">
            {node.props.map((prop, i) => (
              <ObjectPropRow
                key={prop.id}
                prop={prop}
                index={i}
                depth={depth + 1}
                total={node.props.length}
                onChangePropKey={(newKey) => {
                  const n = nodeRef.current;
                  if (n.kind !== "object") return;
                  const props = [...n.props];
                  const cur = n.props[i];
                  if (!cur) return;
                  props[i] = { ...cur, key: newKey };
                  onChange({ ...n, props });
                }}
                onChangeChild={(nextNode) => {
                  const n = nodeRef.current;
                  if (n.kind !== "object") return;
                  const props = [...n.props];
                  const cur = n.props[i];
                  if (!cur) return;
                  props[i] = { ...cur, node: nextNode };
                  onChange({ ...n, props });
                }}
                onMoveUp={() => {
                  const n = nodeRef.current;
                  if (n.kind !== "object" || i <= 0) return;
                  const props = [...n.props];
                  [props[i - 1], props[i]] = [props[i], props[i - 1]];
                  onChange({ ...n, props });
                }}
                onMoveDown={() => {
                  const n = nodeRef.current;
                  if (n.kind !== "object" || i >= n.props.length - 1) return;
                  const props = [...n.props];
                  [props[i], props[i + 1]] = [props[i + 1], props[i]];
                  onChange({ ...n, props });
                }}
                onDuplicate={() => {
                  const n = nodeRef.current;
                  if (n.kind !== "object") return;
                  const cur = n.props[i];
                  if (!cur) return;
                  const props = [...n.props];
                  props.splice(i + 1, 0, {
                    id: createId(),
                    key: suggestNewPropertyKey(props),
                    node: regenerateIds(cur.node),
                  });
                  onChange({ ...n, props });
                }}
                onDelete={() => {
                  const n = nodeRef.current;
                  if (n.kind !== "object") return;
                  const props = n.props.filter((_, j) => j !== i);
                  onChange({ ...n, props });
                }}
              />
            ))}
          </div>
        )}
        <div className={node.collapsed ? "mt-2 ml-1 pl-2" : "mt-2 ml-1 pl-2 border-l border-stone-200 dark:border-stone-700"}>
          <AddChildRow
            label="New property"
            onAddPrimitive={() => {
              const n = nodeRef.current;
              if (n.kind !== "object") return;
              const keyName = suggestNewPropertyKey(n.props);
              onChange({
                ...n,
                collapsed: false,
                props: [
                  ...n.props,
                  {
                    id: createId(),
                    key: keyName,
                    node: emptyPrimitive(),
                  },
                ],
              });
            }}
            onAddObject={() => {
              const n = nodeRef.current;
              if (n.kind !== "object") return;
              const keyName = suggestNewPropertyKey(n.props);
              onChange({
                ...n,
                collapsed: false,
                props: [
                  ...n.props,
                  {
                    id: createId(),
                    key: keyName,
                    node: emptyObject(),
                  },
                ],
              });
            }}
            onAddArray={() => {
              const n = nodeRef.current;
              if (n.kind !== "object") return;
              const keyName = suggestNewPropertyKey(n.props);
              onChange({
                ...n,
                collapsed: false,
                props: [
                  ...n.props,
                  {
                    id: createId(),
                    key: keyName,
                    node: emptyArray(),
                  },
                ],
              });
            }}
          />
        </div>
      </div>
    );
  }

  /* array */
  const summary = `${node.items.length} item${node.items.length === 1 ? "" : "s"}`;
  return (
    <div className="py-1.5 border-b border-stone-100 dark:border-stone-800/80" style={pad}>
      <div className="flex flex-wrap items-start gap-2">
        <Toolbar
          canCollapse
          collapsed={node.collapsed}
          onToggleCollapse={() => {
            const n = nodeRef.current;
            if (n.kind !== "array") return;
            onChange({ ...n, collapsed: !n.collapsed });
          }}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          showDelete={showDelete}
          showDuplicate={showDuplicate}
          showReorder={showReorder}
        />
        <div className="flex flex-1 min-w-0 gap-2 items-center flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-36 shrink-0">{keySlot}</div>
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            Array · {summary}
          </span>
        </div>
      </div>
      {!node.collapsed && (
        <div className="mt-2 space-y-0 border-l border-stone-200 dark:border-stone-700 ml-1 pl-2">
          {node.items.map((item, i) => (
            <NodeEditor
              key={item.id}
              node={item}
              onChange={(next) => {
                const n = nodeRef.current;
                if (n.kind !== "array") return;
                const items = [...n.items];
                items[i] = next;
                onChange({ ...n, items });
              }}
              depth={depth + 1}
              keySlot={
                <span className="block px-2 py-1.5 font-mono text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  [{i}]
                </span>
              }
              onMoveUp={() => {
                const n = nodeRef.current;
                if (n.kind !== "array" || i <= 0) return;
                const items = [...n.items];
                [items[i - 1], items[i]] = [items[i], items[i - 1]];
                onChange({ ...n, items });
              }}
              onMoveDown={() => {
                const n = nodeRef.current;
                if (n.kind !== "array" || i >= n.items.length - 1) return;
                const items = [...n.items];
                [items[i], items[i + 1]] = [items[i + 1], items[i]];
                onChange({ ...n, items });
              }}
              onDuplicate={() => {
                const n = nodeRef.current;
                if (n.kind !== "array") return;
                const cur = n.items[i];
                if (!cur) return;
                const items = [...n.items];
                items.splice(i + 1, 0, regenerateIds(cur));
                onChange({ ...n, items });
              }}
              onDelete={() => {
                const n = nodeRef.current;
                if (n.kind !== "array") return;
                const items = n.items.filter((_, j) => j !== i);
                onChange({ ...n, items });
              }}
              canMoveUp={i > 0}
              canMoveDown={i < node.items.length - 1}
              showDelete
              showReorder
            />
          ))}
        </div>
      )}
      <div className={node.collapsed ? "mt-2 ml-1 pl-2" : "mt-2 ml-1 pl-2 border-l border-stone-200 dark:border-stone-700"}>
        <AddArrayItemRow
          onAddPrimitive={() => {
            const n = nodeRef.current;
            if (n.kind !== "array") return;
            onChange({
              ...n,
              collapsed: false,
              items: [...n.items, emptyPrimitive()],
            });
          }}
          onAddObject={() => {
            const n = nodeRef.current;
            if (n.kind !== "array") return;
            onChange({
              ...n,
              collapsed: false,
              items: [...n.items, emptyObject()],
            });
          }}
          onAddArray={() => {
            const n = nodeRef.current;
            if (n.kind !== "array") return;
            onChange({
              ...n,
              collapsed: false,
              items: [...n.items, emptyArray()],
            });
          }}
        />
      </div>
    </div>
  );
}

function ObjectPropRow({
  prop,
  index,
  depth,
  total,
  onChangePropKey,
  onChangeChild,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) {
  return (
    <NodeEditor
      node={prop.node}
      onChange={onChangeChild}
      depth={depth}
      keySlot={
        <input
          type="text"
          value={prop.key}
          onChange={(e) => onChangePropKey(e.target.value)}
          className={`${inputClass} w-full`}
          spellCheck={false}
        />
      }
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={index > 0}
      canMoveDown={index < total - 1}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      showDelete
    />
  );
}

export default function JsonTreeEditor({ onToast }) {
  const [root, setRoot] = useState(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const loadJson = useCallback((text) => {
    setImportError(null);
    const t = text.trim();
    if (!t) {
      setImportError("Empty input");
      return;
    }
    try {
      const v = JSON.parse(t);
      setRoot(jsonValueToTree(v));
    } catch (e) {
      setImportError(e.message || "Invalid JSON");
    }
  }, []);

  const { output, outputError } = useMemo(() => {
    if (!root) return { output: "", outputError: null };
    try {
      const v = treeToJsonValue(root);
      return { output: JSON.stringify(v, null, 2), outputError: null };
    } catch (e) {
      return { output: "", outputError: e.message || "Could not build JSON" };
    }
  }, [root]);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadJson(String(reader.result || ""));
    reader.onerror = () => setImportError("Could not read file");
    reader.readAsText(file);
  };

  return (
    <div className="max-w-none w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50 flex items-center justify-center gap-3">
          <TreeStructure size={36} weight="thin" className="text-stone-500" />
          JSON Editor
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
          Load JSON from a file or paste text, then edit keys and values, reorder,
          collapse, duplicate, or remove nodes. Live JSON appears on the right.
        </p>
      </header>

      <div
        className={`mb-6 border-2 border-dashed transition-colors p-4 sm:p-6 ${
          dragOver
            ? "border-stone-600 bg-stone-100 dark:bg-stone-800 dark:border-stone-400"
            : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
          Drop a .json file or paste JSON
        </label>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          onPaste={() => setImportError(null)}
          placeholder='{"example": true}'
          rows={5}
          className="w-full p-4 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          spellCheck={false}
        />
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button onClick={() => loadJson(importText)}>Load JSON</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRoot(emptyObject());
              setImportError(null);
            }}
          >
            New empty object
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRoot(emptyArray());
              setImportError(null);
            }}
          >
            New empty array
          </Button>
        </div>
        {importError && (
          <p className="mt-3 text-sm font-mono text-red-600 dark:text-red-400">
            {importError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 min-h-[280px]">
          <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800 text-[11px] font-mono uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Tree
          </div>
          <div className="p-2 max-h-[min(70vh,900px)] overflow-y-auto custom-json-editor-scroll">
            {!root ? (
              <p className="p-4 text-sm font-mono text-stone-500 dark:text-stone-400">
                Load valid JSON above to start editing.
              </p>
            ) : (
              <NodeEditor
                node={root}
                onChange={setRoot}
                depth={0}
                keySlot={
                  <span className="block px-2 py-1.5 font-mono text-[11px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    root
                  </span>
                }
                onMoveUp={() => {}}
                onMoveDown={() => {}}
                canMoveUp={false}
                canMoveDown={false}
                onDuplicate={() => {}}
                onDelete={() => {}}
                showDelete={false}
                showDuplicate={false}
                showReorder={false}
              />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 min-h-[280px]">
          <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800 text-[11px] font-mono uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Output JSON
          </div>
          <div className="p-4">
            {outputError && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-xs">
                {outputError}
              </div>
            )}
            <CopyArea
              text={output}
              onCopySuccess={() => onToast?.("Copied!")}
            />
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-json-editor-scroll::-webkit-scrollbar { width: 6px; }
        .custom-json-editor-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-json-editor-scroll::-webkit-scrollbar-thumb { background-color: rgba(120, 113, 108, 0.45); }
      `,
        }}
      />
    </div>
  );
}
