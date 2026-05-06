/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DataFlowGraph, D3Node, D3Link } from '../types';
import { CodeHealthAudit } from '../services/geminiService';
import { ZoomIn, ZoomOut, Maximize, Target, Activity, ShieldAlert, CheckCircle } from 'lucide-react';

interface D3FlowChartProps {
  data: DataFlowGraph;
  onNodeClick?: (node: D3Node) => void;
  analysisResult?: CodeHealthAudit | null;
  isPro?: boolean;
}

const D3FlowChart: React.FC<D3FlowChartProps> = ({ data, onNodeClick, analysisResult, isPro }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [sim, setSim] = useState<d3.Simulation<D3Node, D3Link> | null>(null);

  // Identify "Hotspots" from node data
  const hotNodesCount = useMemo(() => {
    return data.nodes.filter(n => n.isHot).length;
  }, [data.nodes]);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const simulation = d3.forceSimulation<D3Node>(data.nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(data.links).id(d => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    setSim(simulation);

    const link = g.append('g')
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.1)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', 1);

    const node = g.append('g')
      .selectAll<SVGGElement, D3Node>('g')
      .data(data.nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Node circles with glowing effects for hotspots
    node.append('circle')
      .attr('r', d => (d.id === 'root' ? 8 : 5))
      .attr('fill', d => {
        if (d.id === 'root') return '#10b981'; // emerald-500
        if (d.isHot) return isPro ? '#10b981' : '#f59e0b'; // amber-500 if non-pro, emerald if repaired
        return '#6366f1'; // indigo-500
      })
      .attr('class', d => d.isHot && !isPro ? 'animate-pulse' : '')
      .style('filter', d => d.isHot ? `drop-shadow(0 0 5px ${isPro ? '#10b98180' : '#f59e0b80'})` : 'none')
      .style('transition', 'fill 0.5s ease, filter 0.5s ease');

    // Labels
    node.append('text')
      .attr('dx', 10)
      .attr('dy', '.35em')
      .text(d => d.label)
      .attr('fill', '#94a3b8')
      .style('font-size', '8px')
      .style('font-family', 'ui-monospace, monospace')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    const drag = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    return () => {
      simulation.stop();
    };
  }, [data, isPro, onNodeClick]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-slate-950/50 rounded-2xl border border-white/5 overflow-hidden relative group">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Legend & Stats Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">{data.nodes.length} Nodes</span>
        </div>
        {hotNodesCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/20">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">{hotNodesCount} Hotspots</span>
          </div>
        )}
        {isPro && (
           <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Remaster: Integrity++</span>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2 group-hover:opacity-100 opacity-0 transition-opacity">
        <button onClick={handleZoomIn} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg backdrop-blur-md border border-white/10">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg backdrop-blur-md border border-white/10">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg backdrop-blur-md border border-white/10">
          <Target className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4 text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
        Drag to pan • Scroll to zoom • Click node for Handoff Prompt
      </div>
    </div>
  );
};

export default D3FlowChart;
