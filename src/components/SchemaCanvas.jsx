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
      className={`border bg-surface shadow-sm transition-shadow rounded-panel ${
        selected
          ? "border-emphasis ring-1 ring-emphasis"
          : "border-border-strong"
      }`}
      style={{ width: NODE_WIDTH, minHeight: height }}
      onClick={() => onSelect?.(table.name)}
    >
      <Handle type="target" position={Position.Left} className="!bg-fg-subtle !w-2 !h-2 !border-0" />
      <div className="px-3 py-2 border-b border-border bg-surface-inset">
        <p className="font-mono text-xs font-bold text-fg truncate">
          {table.name}
        </p>
      </div>
      <div className="py-1">
        {table.columns.map((col) => (
          <div
            key={col.name}
            className="px-3 flex items-center justify-between gap-2 font-mono text-[10px] leading-[22px] text-fg-muted"
          >
            <span className="truncate flex items-center gap-1">
              {col.primaryKey && (
                <span className="text-favorite shrink-0" title="Primary key">
                  PK
                </span>
              )}
              {col.references && (
                <span className="text-info shrink-0" title="Foreign key">
                  FK
                </span>
              )}
              <span className="text-fg-soft">{col.name}</span>
            </span>
            <span className="text-fg-subtle shrink-0 truncate max-w-[80px]">
              {col.type}
            </span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-fg-subtle !w-2 !h-2 !border-0" />
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
          style: { stroke: "var(--fg-muted)", strokeWidth: 1.5 },
          labelStyle: { fontSize: 9, fontFamily: "var(--font-mono)" },
          labelBgStyle: { fill: "var(--shell)" },
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
      <div className="h-full flex items-center justify-center text-fg-subtle font-mono text-sm">
        No tables to display
      </div>
    );
  }

  return (
    <div
      className="h-full w-full schema-canvas"
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
          className="!bg-surface !border-border-strong !shadow-none [&>button]:!bg-surface [&>button]:!border-border-strong [&>button]:!text-fg-soft [&>button:hover]:!bg-shell"
        />
        <MiniMap
          nodeColor={() => "#78716c"}
          maskColor="rgba(0,0,0,0.08)"
          className="!bg-surface !border-border-strong"
        />
      </ReactFlow>
    </div>
  );
}
