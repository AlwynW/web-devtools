/**
 * Indent nginx-style config: track `{` / `}` and keep `#` lines as-is.
 */
export function formatNginxConfig(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let depth = 0;
  const ind = (d) => "    ".repeat(Math.max(0, d));

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    if (trimmed.startsWith("#")) {
      out.push(ind(depth) + trimmed);
      continue;
    }

    let t = trimmed;
    while (t.startsWith("}")) {
      depth = Math.max(0, depth - 1);
      out.push(ind(depth) + "}");
      t = t.slice(1).trim();
    }
    if (!t) continue;

    out.push(ind(depth) + t);
    const open = (t.match(/\{/g) || []).length;
    const close = (t.match(/\}/g) || []).length;
    depth += open - close;
    if (depth < 0) depth = 0;
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

export function lintNginxConfig(source) {
  const issues = [];
  let depth = 0;
  let lineNo = 0;
  const serverNames = [];

  for (const raw of source.split("\n")) {
    lineNo++;
    const t = raw.trim();
    if (!t || t.startsWith("#")) continue;

    for (const ch of t) {
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth < 0) {
          issues.push({ line: lineNo, msg: "Unmatched `}`" });
          depth = 0;
        }
      }
    }

    const m = t.match(/^\s*server_name\s+([^;]+);/);
    if (m) {
      serverNames.push({ line: lineNo, names: m[1].trim() });
    }
  }

  if (depth !== 0) {
    issues.push({ line: lineNo, msg: `${depth} unclosed block(s) (\`{\`)` });
  }

  const seen = new Map();
  for (const { line, names } of serverNames) {
    const key = names.replace(/\s+/g, " ");
    if (seen.has(key)) {
      issues.push({
        line,
        msg: `Duplicate server_name (also line ${seen.get(key)}): ${key.slice(0, 60)}${key.length > 60 ? "…" : ""}`,
      });
    } else {
      seen.set(key, line);
    }
  }

  return issues;
}
