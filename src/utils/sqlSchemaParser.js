/**
 * Parse SQL DDL/DML into a schema model for visualization.
 * Supports CREATE TABLE (columns, PK, FK, REFERENCES) and INSERT INTO.
 */

/** @typedef {{ table: string, column: string }} Reference */
/** @typedef {{ name: string, type: string, primaryKey: boolean, nullable: boolean, unique: boolean, defaultValue: string|null, references: Reference|null }} Column */
/** @typedef {{ name: string, columns: Column[], foreignKeys: { column: string, refTable: string, refColumn: string }[] }} Table */
/** @typedef {{ columns: string[], rows: string[][] }} TableData */
/** @typedef {{ tables: Table[], data: Record<string, TableData> }} Schema */

function stripComments(sql) {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    if (sql[i] === "/" && sql[i + 1] === "*") {
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += sql[i];
    i++;
  }
  return out;
}

function unquoteIdentifier(name) {
  return name.replace(/^[`"'\[]|[`"'\]]$/g, "");
}

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = sql[i - 1];

    if (inString) {
      current += ch;
      if (ch === stringChar && prev !== "\\") inString = false;
      continue;
    }

    if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === ";") {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = "";
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

function splitTopLevel(content, delimiter = ",") {
  const parts = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const prev = content[i - 1];

    if (inString) {
      current += ch;
      if (ch === stringChar && prev !== "\\") inString = false;
      continue;
    }

    if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === "(") depth++;
    if (ch === ")") depth--;

    if (ch === delimiter && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = "";
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed) parts.push(trimmed);
  return parts;
}

function parseReferences(text) {
  const match = text.match(
    /REFERENCES\s+([`"'\w]+)\s*(?:\(([^)]+)\))?/i
  );
  if (!match) return null;
  return {
    table: unquoteIdentifier(match[1]),
    column: match[2] ? unquoteIdentifier(match[2].trim()) : "id",
  };
}

function parseColumnDef(def, tableForeignKeys) {
  const trimmed = def.trim();
  const upper = trimmed.toUpperCase();

  if (
    upper.startsWith("PRIMARY KEY") ||
    upper.startsWith("FOREIGN KEY") ||
    upper.startsWith("UNIQUE") ||
    upper.startsWith("KEY ") ||
    upper.startsWith("INDEX ") ||
    upper.startsWith("CONSTRAINT ") ||
    upper.startsWith("CHECK ")
  ) {
    if (upper.includes("FOREIGN KEY")) {
      const fkMatch = trimmed.match(
        /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([`"'\w]+)\s*(?:\(([^)]+)\))?/i
      );
      if (fkMatch) {
        const cols = splitTopLevel(fkMatch[1]).map((c) => unquoteIdentifier(c.trim()));
        const refTable = unquoteIdentifier(fkMatch[2]);
        const refCol = fkMatch[3]
          ? unquoteIdentifier(fkMatch[3].trim())
          : "id";
        for (const col of cols) {
          tableForeignKeys.push({ column: col, refTable, refColumn: refCol });
        }
      }
    }
    if (upper.startsWith("PRIMARY KEY")) {
      const pkMatch = trimmed.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        return splitTopLevel(pkMatch[1]).map((c) => ({
          constraint: "pk",
          name: unquoteIdentifier(c.trim()),
        }));
      }
    }
    return [];
  }

  const nameMatch = trimmed.match(/^([`"'\w]+)\s+(.+)$/s);
  if (!nameMatch) return [];

  const name = unquoteIdentifier(nameMatch[1]);
  let rest = nameMatch[2].trim();
  const references = parseReferences(rest);
  if (references) {
    rest = rest.replace(/REFERENCES\s+[`"'\w]+\s*(?:\([^)]+\))?/i, "").trim();
  }

  const typeMatch = rest.match(/^([\w\s(),.]+?)(?:\s+(NOT NULL|NULL|PRIMARY KEY|UNIQUE|DEFAULT|REFERENCES|CHECK|AUTO_INCREMENT|GENERATED|COLLATE|CONSTRAINT)|$)/i);
  const type = typeMatch ? typeMatch[1].trim() : rest.split(/\s+/)[0];

  const primaryKey = /\bPRIMARY\s+KEY\b/i.test(trimmed);
  const nullable = !/\bNOT\s+NULL\b/i.test(trimmed);
  const unique = /\bUNIQUE\b/i.test(trimmed);

  let defaultValue = null;
  const defaultMatch = trimmed.match(/\bDEFAULT\s+('(?:[^'\\]|\\.)*'|NULL|\S+)/i);
  if (defaultMatch) defaultValue = defaultMatch[1];

  const column = {
    name,
    type,
    primaryKey,
    nullable,
    unique,
    defaultValue,
    references,
  };

  if (references) {
    tableForeignKeys.push({
      column: name,
      refTable: references.table,
      refColumn: references.column,
    });
  }

  return [{ constraint: "column", column }];
}

function parseCreateTable(stmt) {
  const match = stmt.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"'\w]+)\s*\(([\s\S]+)\)\s*(?:ENGINE|DEFAULT|COMMENT|;|$)/i
  );
  if (!match) return null;

  const tableName = unquoteIdentifier(match[1]);
  const body = match[2];
  const defs = splitTopLevel(body);
  const foreignKeys = [];
  const columns = [];
  const pendingPk = [];

  for (const def of defs) {
    const parsed = parseColumnDef(def, foreignKeys);
    for (const item of parsed) {
      if (item.constraint === "column") columns.push(item.column);
      if (item.constraint === "pk") pendingPk.push(item.name);
    }
  }

  for (const pkName of pendingPk) {
    const col = columns.find((c) => c.name.toLowerCase() === pkName.toLowerCase());
    if (col) col.primaryKey = true;
  }

  return { name: tableName, columns, foreignKeys };
}

function parseValueList(valuesText) {
  const rows = [];
  let i = 0;

  while (i < valuesText.length) {
    while (i < valuesText.length && valuesText[i] !== "(") i++;
    if (i >= valuesText.length) break;

    i++;
    let depth = 1;
    let current = "";
    const values = [];
    let inString = false;
    let stringChar = "";

    while (i < valuesText.length && depth > 0) {
      const ch = valuesText[i];
      const prev = valuesText[i - 1];

      if (inString) {
        current += ch;
        if (ch === stringChar && prev !== "\\") inString = false;
        i++;
        continue;
      }

      if (ch === "'" || ch === '"') {
        inString = true;
        stringChar = ch;
        current += ch;
        i++;
        continue;
      }

      if (ch === "(") {
        depth++;
        current += ch;
        i++;
        continue;
      }

      if (ch === ")") {
        depth--;
        if (depth === 0) {
          const val = current.trim();
          if (val) values.push(val);
          rows.push(values);
          i++;
          break;
        }
        current += ch;
        i++;
        continue;
      }

      if (ch === "," && depth === 1) {
        values.push(current.trim());
        current = "";
        i++;
        continue;
      }

      current += ch;
      i++;
    }
  }

  return rows;
}

function parseInsert(stmt) {
  const match = stmt.match(
    /INSERT\s+(?:OR\s+\w+\s+)?INTO\s+([`"'\w]+)\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+)/i
  );
  if (!match) return null;

  const table = unquoteIdentifier(match[1]);
  const explicitCols = match[2]
    ? splitTopLevel(match[2]).map((c) => unquoteIdentifier(c.trim()))
    : null;
  const rows = parseValueList(match[3]);

  return { table, columns: explicitCols, rows };
}

/**
 * @param {string} sql
 * @returns {{ schema: Schema|null, error: string|null }}
 */
export function parseSqlSchema(sql) {
  if (!sql?.trim()) {
    return { schema: null, error: "Paste or drop a SQL file to get started." };
  }

  try {
    const cleaned = stripComments(sql);
    const statements = splitStatements(cleaned);
    /** @type {Map<string, Table>} */
    const tableMap = new Map();
    /** @type {Record<string, TableData>} */
    const data = {};

    for (const stmt of statements) {
      const create = parseCreateTable(stmt);
      if (create) {
        tableMap.set(create.name.toLowerCase(), create);
        continue;
      }

      const insert = parseInsert(stmt);
      if (insert) {
        const key = insert.table.toLowerCase();
        if (!data[key]) data[key] = { columns: insert.columns || [], rows: [] };
        if (insert.columns?.length && !data[key].columns.length) {
          data[key].columns = insert.columns;
        }
        data[key].rows.push(...insert.rows);
      }
    }

    const tables = [...tableMap.values()];
    if (tables.length === 0) {
      return {
        schema: null,
        error: "No CREATE TABLE statements found. Include DDL in your SQL file.",
      };
    }

    for (const table of tables) {
      const key = table.name.toLowerCase();
      const tableData = data[key];
      if (tableData && !tableData.columns.length) {
        tableData.columns = table.columns.map((c) => c.name);
      }
    }

    return { schema: { tables, data }, error: null };
  } catch (err) {
    return {
      schema: null,
      error: err instanceof Error ? err.message : "Failed to parse SQL.",
    };
  }
}

export const SAMPLE_SQL = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  published BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

INSERT INTO users (id, email, name) VALUES
  (1, 'alice@example.com', 'Alice'),
  (2, 'bob@example.com', 'Bob'),
  (3, 'carol@example.com', 'Carol');

INSERT INTO posts VALUES
  (1, 1, 'Hello World', 'My first post', TRUE),
  (2, 1, 'SQL Tips', 'Parsing DDL is fun', TRUE),
  (3, 2, 'Draft', 'Work in progress', FALSE);

INSERT INTO comments VALUES
  (1, 1, 2, 'Great post!'),
  (2, 1, 3, 'Thanks for sharing'),
  (3, 2, 1, 'Looking forward to more');

INSERT INTO tags VALUES
  (1, 'sql'),
  (2, 'tutorial'),
  (3, 'database');

INSERT INTO post_tags VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 3);`;
