function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serializeNode(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.replace(/\s+/g, " ").trim();
    return t ? `${pad}${escapeText(t)}\n` : "";
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent}-->\n`;
  }
  if (node.nodeType === Node.DOCUMENT_NODE) {
    const root = node.documentElement;
    if (!root) return "";
    const decl = node.xmlVersion
      ? `<?xml version="1.0" encoding="UTF-8"?>\n`
      : "";
    return decl + serializeNode(root, depth, indentStr);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const name = node.tagName;
  const attrs = [...node.attributes]
    .map((a) => ` ${a.name}="${escapeAttr(a.value)}"`)
    .join("");

  const rawChildren = [...node.childNodes].filter(
    (n) =>
      n.nodeType === Node.ELEMENT_NODE ||
      n.nodeType === Node.COMMENT_NODE ||
      (n.nodeType === Node.TEXT_NODE && n.textContent.trim()),
  );

  if (rawChildren.length === 0) {
    return `${pad}<${name}${attrs}/>\n`;
  }

  const inner = rawChildren.map((c) => serializeNode(c, depth + 1, indentStr)).join("");
  return `${pad}<${name}${attrs}>\n${inner}${pad}</${name}>\n`;
}

export function parseXmlError(xml) {
  const doc = new DOMParser().parseFromString(xml.trim(), "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    return err.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML";
  }
  return null;
}

export function formatXml(xml, indent = "  ") {
  const doc = new DOMParser().parseFromString(xml.trim(), "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    throw new Error(err.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML");
  }
  if (!doc.documentElement) {
    throw new Error("No root element");
  }
  return serializeNode(doc, 0, indent).trim() + "\n";
}

export function minifyXml(xml) {
  const doc = new DOMParser().parseFromString(xml.trim(), "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    throw new Error(err.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML");
  }
  return new XMLSerializer().serializeToString(doc.documentElement);
}
