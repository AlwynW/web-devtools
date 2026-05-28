import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const NODE_WIDTH = 220;
const ROW_HEIGHT = 22;
const HEADER_HEIGHT = 32;
const GRID_COLUMNS = 4;
const H_GAP = 80;
const V_GAP = 60;
const MARGIN = 40;

function getNodeHeight(table) {
  return HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + 8;
}

function TableNode({ data, selected }) {
  const { table, onSelect } = data;
  const height = HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + 8;

  return (
    <div
      className={`border bg-white dark:bg-stone-900 shadow-sm transition-shadow ${
        selected
          ? "border-stone-900 dark:border-stone-300 ring-1 ring-stone-900 dark:ring-stone-300"
          : "border-stone-300 dark:border-stone-700"
      }`}
      style={{ width: NODE_WIDTH, minHeight: height }}
      onClick={() => onSelect?.(table.name)}
    >
      <Handle type="target" position={Position.Left} className="!bg-stone-400 !w-2 !h-2 !border-0" />
      <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <p className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
          {table.name}
        </p>
      </div>
      <div className="py-1">
        {table.columns.map((col) => (
          <div
            key={col.name}
            className="px-3 flex items-center justify-between gap-2 font-mono text-[10px] leading-[22px] text-stone-600 dark:text-stone-400"
          >
            <span className="truncate flex items-center gap-1">
              {col.primaryKey && (
                <span className="text-amber-600 dark:text-amber-400 shrink-0" title="Primary key">
                  PK
                </span>
              )}
              {col.references && (
                <span className="text-sky-600 dark:text-sky-400 shrink-0" title="Foreign key">
                  FK
                </span>
              )}
              <span className="text-stone-800 dark:text-stone-200">{col.name}</span>
            </span>
            <span className="text-stone-400 dark:text-stone-500 shrink-0 truncate max-w-[80px]">
              {col.type}
            </span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-stone-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

function getLayoutedElements(tables, selectedTable, onSelect) {
  const nodes = [];
  let y = MARGIN;

  for (let i = 0; i < tables.length; i += GRID_COLUMNS) {
    const rowTables = tables.slice(i, i + GRID_COLUMNS);
    const rowHeight = Math.max(...rowTables.map(getNodeHeight));

    rowTables.forEach((table, colIndex) => {
      nodes.push({
        id: table.name,
        type: "tableNode",
        data: { table, onSelect },
        position: {
          x: MARGIN + colIndex * (NODE_WIDTH + H_GAP),
          y,
        },
        selected: selectedTable === table.name,
      });
    });

    y += rowHeight + V_GAP;
  }

  const edges = [];
  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      if (tables.some((t) => t.name === fk.refTable)) {
        edges.push({
          id: `${table.name}.${fk.column}->${fk.refTable}.${fk.refColumn}`,
          source: table.name,
          target: fk.refTable,
          label: fk.column,
          type: "smoothstep",
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: { stroke: "var(--schema-edge, #78716c)", strokeWidth: 1.5 },
          labelStyle: { fontSize: 9, fontFamily: "JetBrains Mono, monospace" },
          labelBgStyle: { fill: "var(--schema-label-bg, #f5f5f4)" },
        });
      }
    }
  }

  return { nodes, edges };
}

export default function SchemaCanvas({ tables, selectedTable, onSelectTable }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => getLayoutedElements(tables, selectedTable, onSelectTable),
    [tables, selectedTable, onSelectTable]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = getLayoutedElements(
      tables,
      selectedTable,
      onSelectTable
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [tables, selectedTable, onSelectTable, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event, node) => {
      onSelectTable?.(node.id);
    },
    [onSelectTable]
  );

  if (!tables.length) {
    return (
      <div className="h-full flex items-center justify-center text-stone-400 dark:text-stone-500 font-mono text-sm">
        No tables to display
      </div>
    );
  }

  return (
    <div
      className="h-full w-full schema-canvas [--schema-edge:#78716c] [--schema-label-bg:#f5f5f4] dark:[--schema-edge:#a8a29e] dark:[--schema-label-bg:#292524]"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="var(--schema-grid, #d6d3d1)" />
        <Controls
          className="!bg-white dark:!bg-stone-900 !border-stone-300 dark:!border-stone-700 !shadow-none [&>button]:!bg-white dark:[&>button]:!bg-stone-900 [&>button]:!border-stone-300 dark:[&>button]:!border-stone-700 [&>button]:!text-stone-700 dark:[&>button]:!text-stone-300 [&>button:hover]:!bg-stone-100 dark:[&>button:hover]:!bg-stone-800"
        />
        <MiniMap
          nodeColor={() => "#78716c"}
          maskColor="rgba(0,0,0,0.08)"
          className="!bg-white dark:!bg-stone-900 !border-stone-300 dark:!border-stone-700"
        />
      </ReactFlow>
    </div>
  );
}
