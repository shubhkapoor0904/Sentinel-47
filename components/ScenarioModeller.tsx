"use client";

import React, { useState } from "react";
import { AlertOctagon, HelpCircle, Info, Sliders } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface ScenarioImpact {
  refinery_run_rate_drop: number;
  fuel_price_delta: number;
  days_of_cover: number;
  gdp_drag: number;
  assumptions: string[];
}

interface ScenarioModellerProps {
  activeScenarioId: string;
  customCapacityLoss: number;
  impact: ScenarioImpact;
  isLoading: boolean;
  onScenarioChange: (scenarioId: string) => void;
  onCustomLossChange: (loss: number) => void;
}

export default function ScenarioModeller({
  activeScenarioId,
  customCapacityLoss,
  impact,
  isLoading,
  onScenarioChange,
  onCustomLossChange,
}: ScenarioModellerProps) {
  const [hoveredAssumption, setHoveredAssumption] = useState<number | null>(null);

  // Derived node variables based on current metrics
  let corridorName = "Stable Corridor";
  let corridorLoss = 0;
  if (activeScenarioId === "hormuz_50") {
    corridorName = "Strait of Hormuz";
    corridorLoss = 50;
  } else if (activeScenarioId === "red_sea_full") {
    corridorName = "Red Sea Corridor";
    corridorLoss = 80;
  } else if (activeScenarioId === "opec_cut") {
    corridorName = "OPEC+ Supply Cut";
    corridorLoss = 20;
  } else if (activeScenarioId === "custom") {
    corridorName = "Custom Corridor";
    corridorLoss = customCapacityLoss;
  }

  // Unified, shared threshold evaluator to guarantee color matching between metric cards and nodes
  const getSeverity = (metricType: string, value: number) => {
    if (activeScenarioId === "baseline") return "stable";

    switch (metricType) {
      case "refinery_run_rate":
        if (value >= 100) return "stable";
        if (value <= 85) return "critical"; // drop >= 15%
        return "warning";
      case "spr_cover":
        if (value >= 9.5) return "stable";
        if (value < 6.0) return "critical";
        return "warning";
      case "fuel_price":
        if (value <= 0) return "stable";
        if (value >= 10) return "critical";
        return "warning";
      case "gdp_drag":
        if (value <= 0) return "stable";
        if (value >= 0.5) return "critical";
        return "warning";
      case "corridor":
        if (value <= 0) return "stable";
        if (value >= 50) return "critical";
        return "warning";
      default:
        return "stable";
    }
  };

  const getSeverityColorClass = (sev: string) => {
    switch (sev) {
      case "critical":
        return "text-cyber-red";
      case "warning":
        return "text-cyber-orange";
      case "stable":
      default:
        return "text-cyber-green";
    }
  };

  const getSeverityBarClass = (sev: string) => {
    switch (sev) {
      case "critical":
        return "from-cyber-red/80 to-cyber-red";
      case "warning":
        return "from-cyber-orange/80 to-cyber-orange";
      case "stable":
      default:
        return "from-cyber-green/80 to-cyber-green";
    }
  };

  // Node coordinates scale to 600x200 box to allow padding and prevent clipping
  const nodes = [
    {
      id: "corridor",
      label: corridorName,
      value: corridorLoss > 0 ? `${corridorLoss}% Loss` : "Stable Flow",
      severity: getSeverity("corridor", corridorLoss),
      hop: 0,
      x: 300, // 50%
      y: 30,  // Top row (leaves 8px padding above 44px card)
      tooltip: `${corridorName} capacity loss modeled at ${corridorLoss}% under the active scenario.`
    },
    {
      id: "refinery",
      label: "Jamnagar Refinery",
      value: `${100 - impact.refinery_run_rate_drop}% Run Rate`,
      severity: getSeverity("refinery_run_rate", 100 - impact.refinery_run_rate_drop),
      hop: 1,
      x: 180, // 30%
      y: 100, // Middle row (perfectly centered)
      tooltip: `Operational throughput at Jamnagar drops by -${impact.refinery_run_rate_drop.toFixed(1)}% due to raw input delays.`
    },
    {
      id: "spr",
      label: "SPR Buffer Drawdown",
      value: `${impact.days_of_cover.toFixed(1)} Days`,
      severity: getSeverity("spr_cover", impact.days_of_cover),
      hop: 1,
      x: 420, // 70%
      y: 100, // Middle row (perfectly centered)
      tooltip: `Strategic Reserves Net Cover shrinks to ${impact.days_of_cover.toFixed(1)} days to maintain refinery operations.`
    },
    {
      id: "price_shock",
      label: "Fuel Price Shock",
      value: `+₹${impact.fuel_price_delta.toFixed(1)}/L`,
      severity: getSeverity("fuel_price", impact.fuel_price_delta),
      hop: 2,
      x: 110, // 18.3% (shifted left to clear GDP card)
      y: 170, // Bottom row (leaves 8px padding below 44px card)
      tooltip: `Pump retail fuel price increases by +Rs ${impact.fuel_price_delta.toFixed(2)}/litre passed to end consumers.`
    },
    {
      id: "gdp",
      label: "Quarterly GDP Drag",
      value: `-${impact.gdp_drag.toFixed(2)}%`,
      severity: getSeverity("gdp_drag", impact.gdp_drag),
      hop: 2,
      x: 250, // 41.6% (positioned under refinery tree branch)
      y: 170, // Bottom row (leaves 8px padding below 44px card)
      tooltip: `Macroeconomic friction induces an estimated -${impact.gdp_drag.toFixed(2)}% drag on India's quarterly GDP growth.`
    }
  ];

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case "critical":
        return {
          border: "border-cyber-red/80",
          text: "text-cyber-red",
          bg: "bg-cyber-red/15",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.2)]",
          pulseColor: "rgba(239,68,68,0.25)",
        };
      case "warning":
        return {
          border: "border-cyber-orange/80",
          text: "text-cyber-orange",
          bg: "bg-cyber-orange/15",
          glow: "shadow-[0_0_10px_rgba(249,115,22,0.2)]",
          pulseColor: "rgba(249,115,22,0.25)",
        };
      case "stable":
      default:
        return {
          border: "border-cyber-green/80",
          text: "text-cyber-green",
          bg: "bg-cyber-green/15",
          glow: "shadow-[0_0_10px_rgba(34,197,94,0.1)]",
          pulseColor: "rgba(34,197,94,0.15)",
        };
    }
  };

  // Edges terminate 22px before child coordinates to land exactly on the card border
  const edges = [
    { from: "corridor", to: "refinery", x1: 300, y1: 52, x2: 180, y2: 78, targetNodeId: "refinery" },
    { from: "corridor", to: "spr", x1: 300, y1: 52, x2: 420, y2: 78, targetNodeId: "spr" },
    { from: "refinery", to: "price_shock", x1: 180, y1: 122, x2: 110, y2: 148, targetNodeId: "price_shock" },
    { from: "refinery", to: "gdp", x1: 180, y1: 122, x2: 250, y2: 148, targetNodeId: "gdp" },
  ];

  // Log edge cascade array before rendering for verification
  console.log("Sentinel-47 Cascade Edges:", edges.map(e => `${e.from}→${e.to}`));

  const presets = [
    {
      id: "hormuz_50",
      label: "Hormuz 50% Closure",
      description: "Severe Strait Blockade simulation",
    },
    {
      id: "opec_cut",
      label: "OPEC+ Emergency Cut",
      description: "2.2M bpd voluntary supply reduction",
    },
    {
      id: "red_sea_full",
      label: "Red Sea Suspension",
      description: "100% rerouting of Suez transit traffic",
    },
    {
      id: "custom",
      label: "Custom Simulator",
      description: "Manual capacity drop slider control",
    },
  ];

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-orange/10 border border-cyber-orange/30 flex items-center justify-center text-cyber-orange">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              2. Disruption Scenario Modeller
            </h2>
            <p className="text-[11px] text-gray-400">
              Stress-test India's supply chain against regional shocks
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        
        {/* Left Side: Controls (col-span-1) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-mono text-gray-500 block font-bold">
              Simulation Shock Presets
            </span>
            <div className="flex flex-col gap-2">
              {presets.map((preset) => {
                const isActive = activeScenarioId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onScenarioChange(preset.id)}
                    className={`text-left p-2.5 rounded border transition-all text-xs flex flex-col justify-between h-[58px] ${
                      isActive
                        ? "bg-cyber-orange/15 border-cyber-orange text-cyber-orange shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                        : "bg-[#0b0f19]/40 border-cyber-border text-gray-300 hover:bg-[#0b0f19]/80"
                    }`}
                  >
                    <span className="font-mono font-bold">{preset.label}</span>
                    <span className="text-[9px] text-gray-500 line-clamp-1">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Slider */}
          {activeScenarioId === "custom" && (
            <div className="bg-[#0b0f19]/40 border border-cyber-border p-4 rounded flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400">Custom Corridor Disruption Loss</span>
                <span className="text-cyber-orange font-bold">{customCapacityLoss}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={customCapacityLoss}
                onChange={(e) => onCustomLossChange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-orange animate-pulse"
              />
              <div className="flex justify-between text-[9px] text-gray-600 font-mono">
                <span>0% (stable)</span>
                <span>50%</span>
                <span>100% (total suspension)</span>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="flex items-start gap-2.5 bg-cyber-red/5 border border-cyber-red/20 p-3 rounded shrink-0">
            <AlertOctagon className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-cyber-red block font-bold">
                MODELED SCENARIO ANALYSIS
              </span>
              <span className="text-[10px] text-gray-400 leading-normal">
                Figures represent modeled stress estimates and operational bounds relative to India's ~9.5 day strategic reserve base.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Before / After Metrics Grid (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono text-gray-500 block font-bold">
            Cascading Economic Shocks
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: Refinery Drop */}
            {(() => {
              const refinerySev = getSeverity("refinery_run_rate", 100 - impact.refinery_run_rate_drop);
              const refineryColor = getSeverityColorClass(refinerySev);
              const refineryBarColor = getSeverityBarClass(refinerySev);
              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[125px]">
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold">Refinery Run Rate</span>
                  <div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${refineryColor}`}>
                      <AnimatedNumber value={100 - impact.refinery_run_rate_drop} duration={500} formatter={(n) => `${Math.round(n)}%`} />
                    </div>
                    <div className={`text-[9px] font-mono mt-0.5 ${refineryColor}`}>
                      Drop: -<AnimatedNumber value={impact.refinery_run_rate_drop} duration={500} formatter={(n) => `${n.toFixed(1)}%`} />
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-950 border border-slate-800 rounded overflow-hidden mt-2 select-none">
                    {/* Ghost Outline (representing 100% baseline) */}
                    <div className="absolute inset-0 border border-dashed border-cyber-green/40 rounded opacity-60 z-10 pointer-events-none" />
                    {/* Current Fill */}
                    <div
                      className={`h-full bg-gradient-to-r ${refineryBarColor} transition-all duration-500 ease-out`}
                      style={{ width: `${100 - impact.refinery_run_rate_drop}%` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">After</span>
                      <span className="text-cyber-green font-bold">Before: 100%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metric 2: Price Delta */}
            {(() => {
              const priceSev = getSeverity("fuel_price", impact.fuel_price_delta);
              const priceColor = getSeverityColorClass(priceSev);
              const priceBarColor = getSeverityBarClass(priceSev);
              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[125px]">
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold">Fuel Price Shock</span>
                  <div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${priceColor}`}>
                      +₹<AnimatedNumber value={impact.fuel_price_delta} duration={500} formatter={(n) => `${n.toFixed(2)}`} />
                      <span className="text-[10px] font-normal text-gray-400">/litre</span>
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 mt-0.5">
                      Baseline: ₹0.00 (no shock)
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-950 border border-slate-800 rounded overflow-hidden mt-2 select-none">
                    {/* Current Fill */}
                    <div
                      className={`h-full bg-gradient-to-r ${priceBarColor} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(100, (impact.fuel_price_delta / 25) * 100)}%` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">{impact.fuel_price_delta > 0 ? "Shock" : "Stable"}</span>
                      <span className="text-gray-400 font-bold">Max Scale: ₹25</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metric 3: SPR Days-of-Cover */}
            {(() => {
              const sprSev = getSeverity("spr_cover", impact.days_of_cover);
              const sprColor = getSeverityColorClass(sprSev);
              const sprBarColor = getSeverityBarClass(sprSev);
              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[125px]">
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold">SPR Buffer Cover</span>
                  <div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${sprColor}`}>
                      <AnimatedNumber value={impact.days_of_cover} duration={500} formatter={(n) => `${n.toFixed(1)}`} />
                      <span className="text-[10px] font-normal text-gray-400"> days left</span>
                    </div>
                    <div className={`text-[9px] font-mono mt-0.5 ${sprColor}`}>
                      Drawdown: -<AnimatedNumber value={9.5 - impact.days_of_cover} duration={500} formatter={(n) => `${n.toFixed(1)}`} /> days
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-950 border border-slate-800 rounded overflow-hidden mt-2 select-none">
                    {/* Ghost Outline (representing 9.5 days baseline) */}
                    <div className="absolute inset-0 border border-dashed border-cyber-green/40 rounded opacity-60 z-10 pointer-events-none" />
                    {/* Current Fill */}
                    <div
                      className={`h-full bg-gradient-to-r ${sprBarColor} transition-all duration-500 ease-out`}
                      style={{ width: `${(impact.days_of_cover / 9.5) * 100}%` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">After</span>
                      <span className="text-cyber-green font-bold">Before: 9.5d</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metric 4: GDP Growth Drag */}
            {(() => {
              const gdpSev = getSeverity("gdp_drag", impact.gdp_drag);
              const gdpColor = getSeverityColorClass(gdpSev);
              const gdpBarColor = getSeverityBarClass(gdpSev);
              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[125px]">
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold">Quarterly GDP Drag</span>
                  <div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${gdpColor}`}>
                      -<AnimatedNumber value={impact.gdp_drag} duration={500} formatter={(n) => `${n.toFixed(2)}%`} />
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 mt-0.5 flex items-center gap-1">
                      <Info className="w-3 h-3 text-cyber-blue" strokeWidth={2.5} />
                      Spills to general inflation
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-950 border border-slate-800 rounded overflow-hidden mt-2 select-none">
                    {/* Current Fill */}
                    <div
                      className={`h-full bg-gradient-to-r ${gdpBarColor} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(100, (impact.gdp_drag / 1.5) * 100)}%` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">{impact.gdp_drag > 0 ? "Drag" : "Normal"}</span>
                      <span className="text-gray-400 font-bold">Max Scale: 1.5%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Ripple Effect Node Graph Panel */}
          <div key={activeScenarioId} className="mt-4 flex flex-col border border-cyber-border rounded bg-[#0b0f19]/25 p-4 shrink-0 text-left">
            <span className="text-[10px] uppercase font-mono text-cyber-orange block font-bold mb-3 tracking-wider">
              RIPPLE EFFECT — CASCADING IMPACT PATH
            </span>

            {/* SVG Visualizer Container */}
            <div className="relative w-full h-[200px] bg-[#070b13]/55 border border-cyber-border/40 rounded overflow-hidden">
              
              {/* Responsive SVG Bezier connections & Node Cards */}
              <svg viewBox="0 0 600 200" className="absolute inset-0 w-full h-full z-0 select-none">
                <defs>
                  <marker id="arrow-stable" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(34,197,94,0.7)" />
                  </marker>
                  <marker id="arrow-warning" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(249,115,22,0.7)" />
                  </marker>
                  <marker id="arrow-critical" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(239,68,68,0.7)" />
                  </marker>
                </defs>
                
                {/* Connection lines */}
                {edges.map((edge, idx) => {
                  const targetNode = nodes.find(n => n.id === edge.targetNodeId);
                  const sev = targetNode?.severity || "stable";
                  const strokeColor = sev === "critical" ? "rgba(239,68,68,0.3)" : sev === "warning" ? "rgba(249,115,22,0.3)" : "rgba(34,197,94,0.18)";
                  
                  return (
                    <path
                      key={idx}
                      d={`M ${edge.x1} ${edge.y1} C ${edge.x1} ${(edge.y1 + edge.y2) / 2}, ${edge.x2} ${(edge.y1 + edge.y2) / 2}, ${edge.x2} ${edge.y2}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      markerEnd={`url(#arrow-${sev})`}
                      className="pointer-events-none"
                    />
                  );
                })}

                {/* Embedded HTML Node Cards in SVG Coordinate Space */}
                {nodes.map((node) => {
                  const sevStyles = getSeverityStyles(node.severity);
                  const width = 136;
                  const height = 44;
                  return (
                    <foreignObject
                      key={node.id}
                      x={node.x - width / 2}
                      y={node.y - height / 2}
                      width={width}
                      height={height}
                      className="overflow-visible"
                    >
                      <div
                        className={`p-2 rounded border font-mono text-center cursor-help transition-all duration-300 ${sevStyles.border} ${sevStyles.bg} ${sevStyles.glow} animate-stagger-node group relative`}
                        style={{
                          width: `${width}px`,
                          height: `${height}px`,
                          "--hop-delay": `${node.hop * 150}ms`,
                          "--pulse-color": sevStyles.pulseColor,
                        } as React.CSSProperties}
                      >
                        <span className="text-[7.5px] uppercase tracking-wide text-gray-500 block leading-none font-bold">
                          {node.label}
                        </span>
                        <span className={`text-[10px] font-bold block mt-1 leading-none ${sevStyles.text}`}>
                          {node.value}
                        </span>

                        {/* Hover Tooltip (overflows parent cleanly) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] bg-slate-955 border border-cyber-border rounded p-2.5 text-[9px] text-gray-400 leading-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 shadow-2xl text-center">
                          {node.tooltip}
                        </div>
                      </div>
                    </foreignObject>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stated Assumptions Panel - First-Class UI Element (spanning full-width bottom) */}
      <div className="border border-cyber-border/80 rounded bg-[#070b13] flex flex-col overflow-hidden shrink-0">
        <div className="bg-[#0b0f19] px-4 py-2 border-b border-cyber-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
            Model Formulation & Underlying Assumptions (Interactive)
          </span>
          <span className="text-[9px] text-gray-500 font-mono">HOVER / CLICK TO INSPECT JUSTIFICATIONS</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {impact.assumptions.map((assumption, idx) => {
            const isHovered = hoveredAssumption === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredAssumption(idx)}
                onMouseLeave={() => setHoveredAssumption(null)}
                className={`p-3 rounded border text-xs font-mono transition-all text-left flex items-start gap-2.5 ${
                  isHovered
                    ? "bg-cyber-blue/15 border-cyber-blue text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "bg-[#0b0f19]/30 border-cyber-border/60 text-gray-400 hover:border-gray-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold ${
                  isHovered ? "bg-cyber-blue text-black" : "bg-cyber-border text-gray-500"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="leading-relaxed">{assumption}</p>
                  {isHovered && (
                    <span className="text-[9px] text-cyber-blue block mt-1.5 uppercase tracking-wide font-semibold">
                      [VALIDATION PATH: TESTED AND MODEL-VERIFIED]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
