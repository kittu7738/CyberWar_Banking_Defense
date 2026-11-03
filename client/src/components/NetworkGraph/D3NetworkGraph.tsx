import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper, Tooltip, IconButton, Stack, LinearProgress } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HubIcon from '@mui/icons-material/Hub';
import { BankingAsset, OperationalStatus } from '../../types/index.js';

interface D3NetworkGraphProps {
  assets: BankingAsset[];
  selectedAssetId?: string;
  onSelectAsset: (asset: BankingAsset) => void;
  height?: number;
}

interface GraphNode extends d3.SimulationNodeDatum, BankingAsset {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const STATUS_COLORS: Record<OperationalStatus, string> = {
  HEALTHY: '#10b981', // Cyber Emerald
  DEGRADED: '#f59e0b', // Amber Alert
  COMPROMISED: '#ef4444', // Crimson Alert
  OFFLINE: '#64748b', // Slate
  RECOVERING: '#0284c7' // Electric Blue
};

const STATUS_GLOWS: Record<OperationalStatus, string> = {
  HEALTHY: 'rgba(16, 185, 129, 0.4)',
  DEGRADED: 'rgba(245, 158, 11, 0.5)',
  COMPROMISED: 'rgba(239, 68, 68, 0.6)',
  OFFLINE: 'rgba(100, 116, 139, 0.3)',
  RECOVERING: 'rgba(2, 132, 199, 0.5)'
};

const getEffectiveStatus = (d: BankingAsset): OperationalStatus => {
  if (d.healthScore === 0 && (d.operationalStatus === 'DEGRADED' || d.operationalStatus === 'HEALTHY')) {
    return 'COMPROMISED';
  }
  return d.operationalStatus;
};

export const D3NetworkGraph: React.FC<D3NetworkGraphProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  height = 580
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hoveredNode, setHoveredNode] = useState<BankingAsset | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || assets.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Cyber Blueprint Grid Pattern
    const pattern = defs.append('pattern')
      .attr('id', 'cyber-grid')
      .attr('width', 32)
      .attr('height', 32)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 32 0 L 0 0 0 32')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 0.75)
      .attr('stroke-opacity', 0.6);

    // Grid dots at intersections
    pattern.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 1)
      .attr('fill', '#cbd5e1');

    // Arrow markers for normal and alert conduits
    defs.append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    defs.append('marker')
      .attr('id', 'arrow-alert')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ef4444');

    // Illuminated node shadow filter
    const filter = defs.append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '3')
      .attr('stdDeviation', '4')
      .attr('flood-color', '#0284c7')
      .attr('flood-opacity', '0.12');

    // Background Rect with Cyber Grid
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#cyber-grid)');

    const g = svg.append('g').attr('class', 'main-group');

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Build Nodes and Links
    const nodes: GraphNode[] = assets.map(a => ({ ...a }));
    const links: GraphLink[] = [];

    for (const asset of assets) {
      for (const depId of asset.dependencies) {
        if (assets.some(a => a.id === depId)) {
          links.push({
            source: asset.id,
            target: depId
          });
        }
      }
    }

    // Force Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(135).strength(0.65))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(48));

    // Render Data Conduits (Links)
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => {
        const src = typeof d.source === 'object' ? (d.source as GraphNode) : nodes.find(n => n.id === d.source);
        const tgt = typeof d.target === 'object' ? (d.target as GraphNode) : nodes.find(n => n.id === d.target);
        const isAlert = (src && getEffectiveStatus(src) === 'COMPROMISED') || (tgt && getEffectiveStatus(tgt) === 'COMPROMISED');
        return isAlert ? '#fca5a5' : '#cbd5e1';
      })
      .attr('stroke-width', d => {
        const src = typeof d.source === 'object' ? (d.source as GraphNode) : nodes.find(n => n.id === d.source);
        const tgt = typeof d.target === 'object' ? (d.target as GraphNode) : nodes.find(n => n.id === d.target);
        const isAlert = (src && getEffectiveStatus(src) === 'COMPROMISED') || (tgt && getEffectiveStatus(tgt) === 'COMPROMISED');
        return isAlert ? 2.5 : 1.75;
      })
      .attr('stroke-dasharray', d => {
        const src = typeof d.source === 'object' ? (d.source as GraphNode) : nodes.find(n => n.id === d.source);
        const tgt = typeof d.target === 'object' ? (d.target as GraphNode) : nodes.find(n => n.id === d.target);
        const isAlert = (src && getEffectiveStatus(src) === 'COMPROMISED') || (tgt && getEffectiveStatus(tgt) === 'COMPROMISED');
        return isAlert ? '6, 3' : '4, 4';
      })
      .attr('marker-end', d => {
        const src = typeof d.source === 'object' ? (d.source as GraphNode) : nodes.find(n => n.id === d.source);
        const tgt = typeof d.target === 'object' ? (d.target as GraphNode) : nodes.find(n => n.id === d.target);
        const isAlert = (src && getEffectiveStatus(src) === 'COMPROMISED') || (tgt && getEffectiveStatus(tgt) === 'COMPROMISED');
        return isAlert ? 'url(#arrow-alert)' : 'url(#arrow-default)';
      });

    // Render Node Groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
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
          })
      );

    // Node outer halo ring
    node.append('circle')
      .attr('class', 'outer-halo')
      .attr('r', d => (d.criticality === 'CRITICAL' ? 26 : d.criticality === 'HIGH' ? 22 : 18))
      .attr('fill', d => STATUS_GLOWS[getEffectiveStatus(d)] || 'rgba(2, 132, 199, 0.2)')
      .attr('stroke', d => (d.id === selectedAssetId ? '#0284c7' : STATUS_COLORS[getEffectiveStatus(d)]))
      .attr('stroke-width', d => (d.id === selectedAssetId ? 3.5 : d.criticality === 'CRITICAL' ? 2.5 : 1.5))
      .attr('filter', 'url(#node-shadow)');

    // Node middle ring for critical assets
    node.filter(d => d.criticality === 'CRITICAL')
      .append('circle')
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', d => STATUS_COLORS[getEffectiveStatus(d)])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2, 3')
      .attr('opacity', 0.7);

    // Node inner core circle (solid status)
    node.append('circle')
      .attr('class', 'inner-core')
      .attr('r', d => (d.criticality === 'CRITICAL' ? 14 : d.criticality === 'HIGH' ? 12 : 10))
      .attr('fill', d => STATUS_COLORS[getEffectiveStatus(d)])
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5);

    // Node title label
    node.append('text')
      .text(d => d.name.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('dy', 34)
      .attr('fill', '#0f172a')
      .attr('font-size', '11px')
      .attr('font-weight', '800')
      .attr('font-family', '"Plus Jakarta Sans", sans-serif');

    // Node status sub-label
    node.append('text')
      .text(d => getEffectiveStatus(d))
      .attr('text-anchor', 'middle')
      .attr('dy', 47)
      .attr('fill', d => STATUS_COLORS[getEffectiveStatus(d)])
      .attr('font-size', '9px')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-weight', '800');

    // Events
    node
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectAsset(d);
      })
      .on('mouseenter', (event: MouseEvent, d) => {
        setHoveredNode(d);
        if (event.currentTarget) {
          d3.select(event.currentTarget as SVGGElement).select('.outer-halo')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 0.4);
        }
      })
      .on('mouseleave', (event: MouseEvent, d) => {
        setHoveredNode(null);
        if (event.currentTarget) {
          d3.select(event.currentTarget as SVGGElement).select('.outer-halo')
            .attr('stroke-width', d.id === selectedAssetId ? 3.5 : 1.5)
            .attr('fill-opacity', 0.2);
        }
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [assets, selectedAssetId, height]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height,
        bgcolor: '#ffffff',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* Zoom / Navigation Controls */}
      <Stack
        direction="column"
        spacing={1}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.08)',
          p: 0.5,
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        <Tooltip title="Zoom In" placement="left">
          <IconButton size="small" onClick={handleZoomIn} sx={{ color: '#0284c7' }}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out" placement="left">
          <IconButton size="small" onClick={handleZoomOut} sx={{ color: '#64748b' }}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset View" placement="left">
          <IconButton size="small" onClick={handleResetZoom} sx={{ color: '#64748b' }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Cyber Topology HUD Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          px: 2,
          py: 1,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 0.5 }}>
          <HubIcon sx={{ fontSize: 16, color: '#0284c7' }} />
          <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800, letterSpacing: '0.04em' }}>
            TOPOLOGY STATUS:
          </Typography>
        </Box>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
            <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.72rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
              {status}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Floating Asset HUD Inspection Card */}
      {hoveredNode && (
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            p: 2,
            minWidth: 260,
            bgcolor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            border: '1px solid #bae6fd',
            borderRadius: 2.5
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {hoveredNode.name}
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: STATUS_COLORS[getEffectiveStatus(hoveredNode)],
                boxShadow: `0 0 6px ${STATUS_COLORS[getEffectiveStatus(hoveredNode)]}`
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1, fontFamily: '"JetBrains Mono", monospace' }}>
            {hoveredNode.ipSubnet} • Tier: {hoveredNode.tier}
          </Typography>

          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>Health Score</Typography>
              <Typography variant="caption" sx={{ color: STATUS_COLORS[getEffectiveStatus(hoveredNode)], fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                {hoveredNode.healthScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={hoveredNode.healthScore}
              sx={{
                height: 5,
                borderRadius: 2.5,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: STATUS_COLORS[getEffectiveStatus(hoveredNode)]
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Criticality:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: hoveredNode.criticality === 'CRITICAL' ? '#ef4444' : '#0284c7' }}>
              {hoveredNode.criticality}
            </Typography>
          </Box>
        </Paper>
      )}

      <svg ref={svgRef} width="100%" height={height} style={{ display: 'block' }} />
    </Box>
  );
};
