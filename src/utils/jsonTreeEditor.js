/** @typedef {{ kind: 'primitive'; id: string; text: string }} PrimitiveNode */
/** @typedef {{ id: string; key: string; node: JsonTreeNode }} ObjectProp */
/** @typedef {{ kind: 'object'; id: string; collapsed: boolean; props: ObjectProp[] }} ObjectNode */
/** @typedef {{ kind: 'array'; id: string; collapsed: boolean; items: JsonTreeNode[] }} ArrayNode */
/** @typedef {PrimitiveNode | ObjectNode | ArrayNode} JsonTreeNode */

export function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `n_${crypto.randomUUID()}`;
  }
  return `n_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

/** @param {{ key: string }[]} props */
export function suggestNewPropertyKey(props) {
  const used = new Set((props ?? []).map((p) => p.key));
  if (!used.has("newKey")) return "newKey";
  let i = 2;
  while (used.has(`newKey${i}`)) i += 1;
  return `newKey${i}`;
}

/** @param {unknown} value */
export function jsonValueToTree(value) {
  if (value === null || typeof value !== "object") {
    return {
      kind: "primitive",
      id: createId(),
      text: JSON.stringify(value),
    };
  }
  if (Array.isArray(value)) {
    return {
      kind: "array",
      id: createId(),
      collapsed: false,
      items: value.map((v) => jsonValueToTree(v)),
    };
  }
  return {
    kind: "object",
    id: createId(),
    collapsed: false,
    props: Object.keys(value).map((k) => ({
      id: createId(),
      key: k,
      node: jsonValueToTree(value[k]),
    })),
  };
}

/** @param {JsonTreeNode} node */
export function regenerateIds(node) {
  if (node.kind === "primitive") {
    return { ...node, id: createId() };
  }
  if (node.kind === "object") {
    return {
      ...node,
      id: createId(),
      props: node.props.map((p) => ({
        ...p,
        id: createId(),
        node: regenerateIds(p.node),
      })),
    };
  }
  return {
    ...node,
    id: createId(),
    items: node.items.map((item) => regenerateIds(item)),
  };
}

/**
 * Parse primitive text: JSON.parse when possible, else raw string.
 * @param {string} text
 */
export function primitiveTextToValue(text) {
  const t = text.trim();
  if (t === "") return null;
  try {
    return JSON.parse(t);
  } catch {
    return text;
  }
}

/**
 * @param {JsonTreeNode} node
 * @returns {unknown}
 */
export function treeToJsonValue(node) {
  if (node.kind === "primitive") {
    return primitiveTextToValue(node.text);
  }
  if (node.kind === "object") {
    const out = {};
    for (const p of node.props) {
      out[p.key] = treeToJsonValue(p.node);
    }
    return out;
  }
  return node.items.map((item) => treeToJsonValue(item));
}

/** @returns {PrimitiveNode} */
export function emptyPrimitive() {
  return { kind: "primitive", id: createId(), text: "null" };
}

/** @returns {ObjectNode} */
export function emptyObject() {
  return { kind: "object", id: createId(), collapsed: false, props: [] };
}

/** @returns {ArrayNode} */
export function emptyArray() {
  return { kind: "array", id: createId(), collapsed: false, items: [] };
}
