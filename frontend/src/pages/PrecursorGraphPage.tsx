import React, { useState, useEffect, useMemo } from 'react';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Info,
} from 'lucide-react';
import { fetchPrecursorGraph } from '../services';
import { PrecursorGraphData, PrecursorNode, PrecursorEdge, NodeType } from '../types/graph';
import { useReportDrawer } from '../context/DrawerContext';
import { useGlobalFilters } from '../context/FilterContext';

const NODE_TYPE_COLORS: Record<NodeType, { fill: string; stroke: string; label: string }> = {
  Activity: { fill: '#3CA0A2', stroke: '#1A686B', label: 'Activity' },
  EnergySource: { fill: '#F59E0B', stroke: '#B45309', label: 'Energy Source' },
  BarrierFailure: { fill: '#EF4444', stroke: '#B91C1C', label: 'Barrier Failure' },
  LifeSavingRule: { fill: '#6366F1', stroke: '#4338CA', label: 'Life-Saving Rule' },
  Location: { fill: '#10B981', stroke: '#047857', label: 'Location' },
};

interface PositionedNode extends PrecursorNode {
  x: number;
  y: number;
  radius: number;
}

export const PrecursorGraphPage: React.FC = () => {
  const { filters } = useGlobalFilters();
  const { openReport } = useReportDrawer();

  const [graphData, setGraphData] = useState<PrecursorGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  // Graph interactive controls
  const [minLift, setMinLift] = useState<number>(3.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledTypes, setEnabledTypes] = useState<Record<NodeType, boolean>>({
    Activity: true,
    EnergySource: true,
    BarrierFailure: true,
    LifeSavingRule: true,
    Location: true,
  });

  // Selection states
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<PrecursorEdge | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    async function loadGraph() {
      setLoading(true);
      try {
        const data = await fetchPrecursorGraph(filters);
        if (isMounted) setGraphData(data);
      } catch (err) {
        console.error('Failed to load precursor graph', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGraph();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Compute node layout coordinates deterministically
  const layout = useMemo<{ nodes: PositionedNode[]; edges: PrecursorEdge[] }>(() => {
    if (!graphData) return { nodes: [], edges: [] };

    // Filter nodes by enabled types and search query
    const filteredNodes = graphData.nodes.filter((node: PrecursorNode) => {
      if (!enabledTypes[node.type]) return false;
      if (searchQuery.trim() && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    const nodeIds = new Set<string>(filteredNodes.map((n: PrecursorNode) => n.id));

    // Filter edges by minLift and active endpoints
    const filteredEdges = graphData.edges.filter((edge: PrecursorEdge) => {
      return (
        edge.lift >= minLift &&
        nodeIds.has(edge.source) &&
        nodeIds.has(edge.target)
      );
    });

    // Circular multi-tier layout for clear separation
    const width = 800;
    const height = 540;
    const centerX = width / 2;
    const centerY = height / 2;

    const positionedNodes: PositionedNode[] = filteredNodes.map((node: PrecursorNode) => {
      let radius = 180;
      if (node.type === 'EnergySource') radius = 100;
      if (node.type === 'BarrierFailure') radius = 160;
      if (node.type === 'LifeSavingRule') radius = 230;
      if (node.type === 'Activity') radius = 220;

      const typeNodes = filteredNodes.filter((n: PrecursorNode) => n.type === node.type);
      const typeIndex = typeNodes.findIndex((n: PrecursorNode) => n.id === node.id);
      const typeOffset: Record<NodeType, number> = {
        EnergySource: 0,
        BarrierFailure: Math.PI / 2,
        LifeSavingRule: Math.PI,
        Activity: (3 * Math.PI) / 2,
        Location: 0.3,
      };

      const angleStep = (Math.PI * 0.9) / Math.max(typeNodes.length, 1);
      const angle =
        (typeOffset[node.type] || 0) +
        (typeIndex - (typeNodes.length - 1) / 2) * angleStep;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        ...node,
        x,
        y,
        radius: Math.max(16, Math.min(28, node.frequency / 3.5)),
      };
    });

    return {
      nodes: positionedNodes,
      edges: filteredEdges,
    };
  }, [graphData, enabledTypes, minLift, searchQuery]);

  const toggleType = (t: NodeType) => {
    setEnabledTypes((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  const handleNodeClick = (node: PositionedNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (edge: PrecursorEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  if (loading || !graphData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-graphite-500 font-medium">
          Generating precursor co-occurrence network...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* HEADER & CONTROLS TOOLBAR */}
      <div className="bg-surface rounded-lg border border-surface-border p-4 shadow-panel flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-petrol-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-graphite-900">
              Precursor Co-Occurrence Network (Multi-Entity Lift Graph)
            </h2>
          </div>
          <p className="text-xs text-graphite-500 mt-0.5">
            Edges indicate combinations appearing together with statistically elevated lift above random chance
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
          {/* Minimum Lift Slider */}
          <div className="flex items-center gap-2 bg-surface-sunken/60 px-3 py-1.5 rounded border border-surface-border">
            <span className="text-graphite-600 font-medium text-[11px]">Min Lift:</span>
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.5"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-24 accent-petrol-700 cursor-pointer"
            />
            <span className="font-mono font-bold text-petrol-800 w-8">{minLift.toFixed(1)}x</span>
          </div>

          {/* Node Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph entities..."
              className="text-xs pl-8 pr-3 py-1.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600 w-44"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center rounded border border-surface-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.8))}
              className="p-1 text-graphite-600 hover:text-graphite-900"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 text-[10px] font-mono text-graphite-500"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
              className="p-1 text-graphite-600 hover:text-graphite-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* NODE TYPE FILTER TOGGLES */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-bold text-graphite-500 uppercase tracking-wider">
          Filter Entities:
        </span>
        {(Object.keys(NODE_TYPE_COLORS) as NodeType[]).map((t) => {
          const cfg = NODE_TYPE_COLORS[t];
          const active = enabledTypes[t];
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                active
                  ? 'bg-surface shadow-xs text-graphite-800 border-surface-border-strong ring-1 ring-petrol-600/20'
                  : 'bg-surface-sunken/60 text-graphite-400 border-surface-border opacity-60'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cfg.fill }}
              />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN GRAPH CANVAS + INSPECTOR SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph View */}
        <div className="lg:col-span-3 bg-surface rounded-lg border border-surface-border shadow-panel overflow-hidden relative min-h-[560px]">
          <div className="absolute top-3 left-3 z-10 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded border border-surface-border text-[11px] text-graphite-500 font-mono">
            Showing {layout.nodes.length} nodes • {layout.edges.length} high-lift edges
          </div>

          <div className="w-full h-[560px] overflow-hidden flex items-center justify-center bg-slate-50/50 cursor-grab active:cursor-grabbing">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 540"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Edges */}
              {layout.edges.map((edge: PrecursorEdge) => {
                const sourceNode = layout.nodes.find((n: PositionedNode) => n.id === edge.source);
                const targetNode = layout.nodes.find((n: PositionedNode) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isSelected = selectedEdge?.id === edge.id;
                const isRelatedToSelectedNode =
                  selectedNode &&
                  (selectedNode.id === edge.source || selectedNode.id === edge.target);

                const strokeWidth = Math.max(1.5, Math.min(5, (edge.lift - 1) * 1.2));
                const strokeColor = isSelected
                  ? '#DC2626'
                  : isRelatedToSelectedNode
                  ? '#228285'
                  : edge.lift >= 5
                  ? '#DC2626'
                  : '#CBD5E1';

                return (
                  <g
                    key={edge.id}
                    onClick={() => handleEdgeClick(edge)}
                    className="cursor-pointer group"
                  >
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                      strokeOpacity={isSelected || isRelatedToSelectedNode ? 0.9 : 0.45}
                    />
                    {/* Edge midpoint lift pill */}
                    {(isSelected || edge.lift >= 4.5) && (
                      <g
                        transform={`translate(${
                          (sourceNode.x + targetNode.x) / 2
                        }, ${(sourceNode.y + targetNode.y) / 2})`}
                      >
                        <rect
                          x="-18"
                          y="-9"
                          width="36"
                          height="18"
                          rx="4"
                          fill="#0F1318"
                          fillOpacity="0.85"
                        />
                        <text
                          textAnchor="middle"
                          dy="3.5"
                          fontSize="9"
                          fontWeight="bold"
                          fill="#FFFFFF"
                          fontFamily="monospace"
                        >
                          {edge.lift.toFixed(1)}x
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {layout.nodes.map((node: PositionedNode) => {
                const colorConfig = NODE_TYPE_COLORS[node.type] || NODE_TYPE_COLORS.Activity;
                const isSelected = selectedNode?.id === node.id;
                const isEdgeEndpoint =
                  selectedEdge &&
                  (selectedEdge.source === node.id || selectedEdge.target === node.id);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer group"
                  >
                    {(isSelected || isEdgeEndpoint) && (
                      <circle
                        r={node.radius + 6}
                        fill="none"
                        stroke="#228285"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                        className="animate-spin origin-center"
                        style={{ animationDuration: '12s' }}
                      />
                    )}

                    <circle
                      r={node.radius}
                      fill={colorConfig.fill}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-110 shadow-sm"
                    />

                    <text
                      y={node.radius + 12}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#1E293B"
                      className="pointer-events-none select-none drop-shadow-xs"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* DETAILS INSPECTOR PANEL */}
        <div className="bg-surface rounded-lg border border-surface-border p-4 shadow-panel flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
                Network Inspector
              </span>
              <p className="text-xs text-graphite-500 mt-0.5">
                Click any node or link to examine statistical co-occurrence lift
              </p>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="mt-4 space-y-4 text-xs animate-fadeIn">
                <div className="p-3 rounded bg-surface-sunken/60 border border-surface-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: NODE_TYPE_COLORS[selectedNode.type]?.fill,
                      }}
                    />
                    <span className="text-[10px] font-bold uppercase text-graphite-500">
                      {selectedNode.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-graphite-900">{selectedNode.label}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded bg-surface-sunken border">
                    <span className="text-[10px] text-graphite-500 block uppercase">
                      Incident Count
                    </span>
                    <span className="font-mono font-bold text-base text-graphite-900">
                      {selectedNode.frequency}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-sunken border">
                    <span className="text-[10px] text-graphite-500 block uppercase">
                      SIF Correlation
                    </span>
                    <span className="font-mono font-bold text-base text-signal-700">
                      {(selectedNode.sifCorrelation * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Connected High-Lift Pairs */}
                <div>
                  <span className="text-[11px] font-bold uppercase text-graphite-500 block mb-1.5">
                    Highest-Lift Combinations:
                  </span>
                  <div className="space-y-1.5">
                    {graphData.edges
                      .filter(
                        (e: PrecursorEdge) =>
                          e.source === selectedNode.id || e.target === selectedNode.id
                      )
                      .sort((a: PrecursorEdge, b: PrecursorEdge) => b.lift - a.lift)
                      .slice(0, 4)
                      .map((e: PrecursorEdge) => {
                        const otherId = e.source === selectedNode.id ? e.target : e.source;
                        const otherNode = graphData.nodes.find(
                          (n: PrecursorNode) => n.id === otherId
                        );
                        return (
                          <div
                            key={e.id}
                            onClick={() => handleEdgeClick(e)}
                            className="p-2 rounded bg-surface-sunken hover:bg-surface-raised cursor-pointer border text-xs flex items-center justify-between"
                          >
                            <span className="font-medium text-graphite-800 truncate pr-2">
                              ↔ {otherNode?.label}
                            </span>
                            <span className="font-mono font-bold text-petrol-700 shrink-0">
                              {e.lift.toFixed(1)}x
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Edge Details */}
            {selectedEdge && (
              <div className="mt-4 space-y-4 text-xs animate-fadeIn">
                <div className="p-3 rounded bg-petrol-50/60 border border-petrol-200">
                  <span className="text-[10px] font-bold uppercase text-petrol-800 block mb-1">
                    Co-Occurrence Association
                  </span>
                  <div className="text-xs font-bold text-graphite-900">
                    {graphData.nodes.find((n: PrecursorNode) => n.id === selectedEdge.source)?.label}
                    <div className="text-graphite-400 font-normal">interacts with</div>
                    {graphData.nodes.find((n: PrecursorNode) => n.id === selectedEdge.target)?.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded bg-surface-sunken border">
                    <span className="text-[10px] text-graphite-500 block uppercase">
                      Observed Lift
                    </span>
                    <span className="font-mono font-bold text-lg text-signal-700">
                      {selectedEdge.lift.toFixed(2)}x
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-sunken border">
                    <span className="text-[10px] text-graphite-500 block uppercase">
                      Joint Incidents
                    </span>
                    <span className="font-mono font-bold text-lg text-graphite-900">
                      {selectedEdge.coOccurrenceCount}
                    </span>
                  </div>
                </div>

                {/* Associated Reports */}
                {selectedEdge.associatedReportIds && selectedEdge.associatedReportIds.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase text-graphite-500 block mb-1.5">
                      Associated Incident Reports:
                    </span>
                    <div className="space-y-1">
                      {selectedEdge.associatedReportIds.map((repId: string) => (
                        <button
                          key={repId}
                          type="button"
                          onClick={() => openReport(repId)}
                          className="w-full text-left p-2 rounded bg-surface-sunken hover:bg-surface-raised border text-xs font-mono font-bold text-petrol-700 flex items-center justify-between group"
                        >
                          <span>{repId}</span>
                          <ExternalLink className="w-3 h-3 text-graphite-400 group-hover:text-petrol-700" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedNode && !selectedEdge && (
              <div className="mt-8 text-center p-6 text-graphite-400 space-y-2">
                <Network className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">
                  Click any entity node to inspect its frequency and highest-lift risk relationships.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border text-[11px] text-graphite-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-petrol-700 shrink-0" />
            <span>Lift {'>'} 1.0 indicates elements appear together more than chance expectation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
