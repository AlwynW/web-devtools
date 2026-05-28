import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  Database,
  TreeStructure,
  Table as TableIcon,
  X,
  UploadSimple,
  Eye,
} from "phosphor-react";
import Button from "../components/Button";
import SchemaCanvas from "../components/SchemaCanvas";
import { parseSqlSchema, SAMPLE_SQL } from "../utils/sqlSchemaParser";

const tabClass = (active) =>
  `px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] border transition-colors ${
    active
      ? "bg-stone-900 text-stone-50 border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100"
      : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-700 dark:hover:bg-stone-800"
  }`;

function DataModal({ table, tableData, onClose }) {
  const columns =
    tableData?.columns?.length > 0
      ? tableData.columns
      : table?.columns.map((c) => c.name) || [];
  const rows = tableData?.rows || [];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
              {table.name}
            </h3>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              {rows.length} row{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} weight="thin" />
          </button>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          {rows.length === 0 ? (
            <p className="p-8 text-center font-mono text-sm text-stone-500 dark:text-stone-400">
              No INSERT data found for this table.
            </p>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 font-normal uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  >
                    {columns.map((_, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-2 text-stone-800 dark:text-stone-200 whitespace-nowrap max-w-[240px] truncate"
                        title={row[ci] ?? "NULL"}
                      >
                        {row[ci] ?? (
                          <span className="text-stone-400 dark:text-stone-500 italic">NULL</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SqlSchemaVisualizer({ onToast }) {
  const [sqlText, setSqlText] = useState(SAMPLE_SQL);
  const [schema, setSchema] = useState(() => parseSqlSchema(SAMPLE_SQL).schema);
  const [parseError, setParseError] = useState(null);
  const [view, setView] = useState("tables");
  const [selectedTable, setSelectedTable] = useState(
    () => parseSqlSchema(SAMPLE_SQL).schema?.tables[0]?.name ?? null
  );
  const [dataModalTable, setDataModalTable] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadSql = useCallback(
    (text) => {
      const { schema: parsed, error } = parseSqlSchema(text);
      setSqlText(text);
      setParseError(error);
      if (parsed) {
        setSchema(parsed);
        setSelectedTable(parsed.tables[0]?.name ?? null);
        onToast?.("Schema parsed");
      } else {
        setSchema(null);
        setSelectedTable(null);
      }
    },
    [onToast]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => loadSql(String(reader.result));
      reader.readAsText(file);
    },
    [loadSql]
  );

  const onFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => loadSql(String(reader.result));
      reader.readAsText(file);
      e.target.value = "";
    },
    [loadSql]
  );

  const activeTable = useMemo(
    () => schema?.tables.find((t) => t.name === selectedTable) ?? null,
    [schema, selectedTable]
  );

  const activeTableData = useMemo(() => {
    if (!selectedTable || !schema) return null;
    return schema.data[selectedTable.toLowerCase()] ?? null;
  }, [schema, selectedTable]);

  const rowCount = activeTableData?.rows.length ?? 0;

  const modalTable = useMemo(
    () => schema?.tables.find((t) => t.name === dataModalTable) ?? null,
    [schema, dataModalTable]
  );

  return (
    <div className="max-w-none w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 text-center">
        <h2 className="text-4xl font-black tracking-tight text-stone-900 dark:text-stone-50">
          SQL Schema
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400 mt-2 max-w-xl mx-auto">
          Drop or paste DDL to explore tables, columns, relationships, and INSERT data.
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
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <UploadSimple size={20} weight="thin" className="text-stone-400" />
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-stone-500">
            Drop .sql file or paste DDL
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.txt"
            className="hidden"
            onChange={onFileSelect}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Browse
          </Button>
          <Button onClick={() => loadSql(sqlText)}>Parse schema</Button>
          <Button variant="secondary" onClick={() => loadSql(SAMPLE_SQL)}>
            Load sample
          </Button>
        </div>
        <textarea
          value={sqlText}
          onChange={(e) => setSqlText(e.target.value)}
          rows={5}
          spellCheck={false}
          className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 font-mono text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500 resize-y min-h-[100px]"
          placeholder="CREATE TABLE ..."
        />
      </div>

      {parseError && !schema && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 font-mono text-sm text-red-700 dark:text-red-300">
          {parseError}
        </div>
      )}

      {schema && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button type="button" className={tabClass(view === "tables")} onClick={() => setView("tables")}>
              <span className="inline-flex items-center gap-2">
                <TableIcon size={14} weight="thin" />
                Tables
              </span>
            </button>
            <button type="button" className={tabClass(view === "visual")} onClick={() => setView("visual")}>
              <span className="inline-flex items-center gap-2">
                <TreeStructure size={14} weight="thin" />
                Visual
              </span>
            </button>
            <span className="ml-auto text-[11px] font-mono text-stone-500 dark:text-stone-400">
              {schema.tables.length} table{schema.tables.length !== 1 ? "s" : ""}
            </span>
          </div>

          {view === "tables" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 min-h-[480px]">
              <aside className="border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800 overflow-auto max-h-[240px] lg:max-h-none">
                <p className="px-4 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-stone-500 border-b border-stone-200 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
                  Tables
                </p>
                <ul>
                  {schema.tables.map((table) => {
                    const dataRows = schema.data[table.name.toLowerCase()]?.rows.length ?? 0;
                    const isActive = selectedTable === table.name;
                    return (
                      <li key={table.name}>
                        <button
                          type="button"
                          onClick={() => setSelectedTable(table.name)}
                          className={`w-full text-left px-4 py-2.5 font-mono text-xs flex items-center justify-between gap-2 transition-colors ${
                            isActive
                              ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                              : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Database size={14} weight="thin" className="shrink-0" />
                            {table.name}
                          </span>
                          {dataRows > 0 && (
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0">
                              {dataRows}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>

              <section className="flex flex-col min-h-[360px]">
                {activeTable ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-stone-200 dark:border-stone-800">
                      <div>
                        <h3 className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                          {activeTable.name}
                        </h3>
                        <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                          {activeTable.columns.length} column
                          {activeTable.columns.length !== 1 ? "s" : ""}
                          {activeTable.foreignKeys.length > 0 &&
                            ` · ${activeTable.foreignKeys.length} foreign key${activeTable.foreignKeys.length !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        icon={Eye}
                        onClick={() => setDataModalTable(activeTable.name)}
                      >
                        View data{rowCount > 0 ? ` (${rowCount})` : ""}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="sticky top-0 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                          <tr>
                            <th className="px-4 py-2 font-normal uppercase tracking-[0.1em] text-stone-500 w-[180px]">
                              Column
                            </th>
                            <th className="px-4 py-2 font-normal uppercase tracking-[0.1em] text-stone-500 w-[160px]">
                              Type
                            </th>
                            <th className="px-4 py-2 font-normal uppercase tracking-[0.1em] text-stone-500">
                              Attributes
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeTable.columns.map((col) => {
                            const fk = activeTable.foreignKeys.find(
                              (f) => f.column.toLowerCase() === col.name.toLowerCase()
                            );
                            return (
                              <tr
                                key={col.name}
                                className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40"
                              >
                                <td className="px-4 py-2.5 text-stone-900 dark:text-stone-100">
                                  {col.name}
                                </td>
                                <td className="px-4 py-2.5 text-stone-600 dark:text-stone-400">
                                  {col.type}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-wrap gap-1.5">
                                    {col.primaryKey && (
                                      <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        PK
                                      </span>
                                    )}
                                    {fk && (
                                      <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                        FK → {fk.refTable}.{fk.refColumn}
                                      </span>
                                    )}
                                    {col.unique && !col.primaryKey && (
                                      <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                        Unique
                                      </span>
                                    )}
                                    {!col.nullable && (
                                      <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                        NOT NULL
                                      </span>
                                    )}
                                    {col.defaultValue && (
                                      <span className="px-1.5 py-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                                        default {col.defaultValue}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-stone-400 dark:text-stone-500 font-mono text-sm">
                    Select a table
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 h-[calc(100vh-320px)] min-h-[480px]">
              <SchemaCanvas
                tables={schema.tables}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
              />
            </div>
          )}
        </>
      )}

      {modalTable && (
        <DataModal
          table={modalTable}
          tableData={schema?.data[dataModalTable.toLowerCase()]}
          onClose={() => setDataModalTable(null)}
        />
      )}
    </div>
  );
}
