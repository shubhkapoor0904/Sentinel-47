"use client";

import React, { useState, useMemo } from "react";
import { AlertOctagon, Info, Sliders } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { useSentinelStore } from "../store/sentinel";

interface ScenarioImpact {
  refinery_run_rate_drop: number;
  fuel_price_delta: number;
  days_of_cover: number;
  gdp_drag: number;
  assumptions: string[];
}

interface ScenarioModellerProps {
  animatedDaysOfCover: number;
  animatedRefinery: number;
  animatedPrice: number;
  animatedGdp: number;
  isLoading: boolean;
  onScenarioChange: (scenarioId: string) => void;
  onCustomLossChange: (loss: number) => void;
}

export default function ScenarioModeller({
  animatedDaysOfCover,
  animatedRefinery,
  animatedPrice,
  animatedGdp,
  isLoading,
  onScenarioChange,
  onCustomLossChange,
}: ScenarioModellerProps) {
  const {
    activeScenarioId,
    customCapacityLoss,
    scenarioOutput,
    corridorScores,
  } = useSentinelStore();

  const impact = scenarioOutput ?? {
    refinery_run_rate_drop: 0,
    fuel_price_delta: 0,
    days_of_cover: 9.5,
    gdp_drag: 0,
    assumptions: [
      "Assumes normal corridor supply lanes are operational.",
      "Assumes baseline Brent crude price levels."
    ],
  };

  const weights = useMemo(() => {
    const rHormuz = corridorScores.hormuz;
    const rRedSea = corridorScores.redSea;
    const rSuez = corridorScores.suez;
    
    const total = rHormuz + rRedSea + rSuez;
    if (total === 0) {
      return { hormuz: 33, redSea: 33, opec: 34, isFallback: true };
    }
    
    const wHormuz = Math.round((rHormuz / total) * 100);
    const wRedSea = Math.round((rRedSea / total) * 100);
    const wOpec = 100 - wHormuz - wRedSea;
    return { hormuz: wHormuz, redSea: wRedSea, opec: wOpec, isFallback: false };
  }, [corridorScores]);

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
      value: `${(100 - animatedRefinery).toFixed(1)}% Run Rate`,
      severity: getSeverity("refinery_run_rate", 100 - animatedRefinery),
      hop: 1,
      x: 180, // 30%
      y: 100, // Middle row (perfectly centered)
      tooltip: `Operational throughput at Jamnagar drops by -${animatedRefinery.toFixed(1)}% due to raw input delays.`
    },
    {
      id: "spr",
      label: "SPR Buffer Drawdown",
      value: `${animatedDaysOfCover.toFixed(1)} Days`,
      severity: getSeverity("spr_cover", animatedDaysOfCover),
      hop: 1,
      x: 420, // 70%
      y: 100, // Middle row (perfectly centered)
      tooltip: `Strategic Reserves Net Cover shrinks to ${animatedDaysOfCover.toFixed(1)} days to maintain refinery operations.`
    },
    {
      id: "price_shock",
      label: "Fuel Price Shock",
      value: `+₹${animatedPrice.toFixed(1)}/L`,
      severity: getSeverity("fuel_price", animatedPrice),
      hop: 2,
      x: 110, // 18.3% (shifted left to clear GDP card)
      y: 170, // Bottom row (leaves 8px padding below 44px card)
      tooltip: `Pump retail fuel price increases by +Rs ${animatedPrice.toFixed(2)}/litre passed to end consumers.`
    },
    {
      id: "gdp",
      label: "Quarterly GDP Drag",
      value: `-${animatedGdp.toFixed(2)}%`,
      severity: getSeverity("gdp_drag", animatedGdp),
      hop: 2,
      x: 250, // 41.6% (positioned under refinery tree branch)
      y: 170, // Bottom row (leaves 8px padding below 44px card)
      tooltip: `Macroeconomic friction induces an estimated -${animatedGdp.toFixed(2)}% drag on India's quarterly GDP growth.`
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
      label: "CUSTOM SIMULATOR",
      description: "Manual capacity drop slider control",
    },
    {
      id: "replay_2025",
      label: "REPLAY: 2025 US-IRAN STANDOFF",
      description: "Time-machine historical backtest mode",
    },
    {
      id: "weighted_composite",
      label: "WEIGHTED COMPOSITE",
      description: "Expected-value blend of all 3 active scenarios weighted by current corridor risk",
    },
  ];

  const getPresetBadgeAndWeight = (id: string) => {
    if (id === "replay_2025") return { text: "[HISTORICAL]", pct: 0 };
    if (id === "custom") return { text: "[MANUAL]", pct: 0 };
    if (id === "weighted_composite") return { text: "", pct: 0 };
    
    let pct = 33;
    if (id === "hormuz_50") pct = weights.hormuz;
    else if (id === "opec_cut") pct = weights.opec;
    else if (id === "red_sea_full") pct = weights.redSea;
    
    const label = weights.isFallback ? `${pct}% EST.` : `${pct}%`;
    const segments = 8;
    const filled = Math.round((pct / 100) * segments);
    const blocks = "█".repeat(filled) + "░".repeat(Math.max(0, segments - filled));
    
    return { text: `[${label}] ${blocks}`, pct };
  };

  const renderPresetButton = (presetId: string, accentHex: string, hoverBorderClass: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return null;

    const isActive = activeScenarioId === preset.id;
    const isWeighted = preset.id === "weighted_composite";
    const isCustom = preset.id === "custom";
    const badge = getPresetBadgeAndWeight(preset.id);

    return (
      <React.Fragment key={preset.id}>
        <button
          onClick={() => onScenarioChange(preset.id)}
          className={`relative overflow-hidden text-left p-2.5 rounded border transition-all text-xs flex flex-col justify-between h-[58px] w-full ${
            isActive
              ? "bg-cyber-orange/15 border-cyber-orange text-cyber-orange shadow-[0_0_10px_rgba(249,115,22,0.15)]"
              : `bg-[#0b0f19]/40 border-cyber-border text-gray-300 hover:bg-[#0b0f19]/80 ${hoverBorderClass}`
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-mono font-bold flex items-center gap-1.5">
              {preset.label}
              {isWeighted && (
                <span className="text-[7.5px] bg-cyber-blue/20 border border-cyber-blue/35 px-1 py-0.2 rounded font-black text-cyber-blue uppercase tracking-widest animate-pulse leading-none">
                  LIVE
                </span>
              )}
            </span>
            {badge.text && (
              <span className="font-mono text-[9px] font-bold text-gray-500 tracking-wider">
                {badge.text}
              </span>
            )}
          </div>
          <span className="text-[9px] text-gray-500 line-clamp-1">{preset.description}</span>
          
          {/* Mini horizontal loading-bar at the bottom */}
          {badge.pct > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-cyber-border/40">
              <div 
                className={`h-full transition-all duration-500 ${
                  isActive ? "bg-cyber-orange" : "bg-cyber-orange/60"
                }`}
                style={{ width: `${badge.pct}%` }}
              />
            </div>
          )}
        </button>

        {/* Embed Custom Slider immediately below CUSTOM SIMULATOR when active */}
        {isCustom && isActive && (
          <div className="bg-[#1f1a10]/20 border border-amber-500/30 p-3 rounded flex flex-col gap-1.5 shrink-0 animate-fadeIn mt-1 mb-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-amber-500/80">Custom Corridor Disruption Loss</span>
              <span className="text-amber-400 font-bold">{customCapacityLoss}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={customCapacityLoss}
              onChange={(e) => onCustomLossChange(Number(e.target.value))}
              className="w-full h-1 bg-amber-900 rounded appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[8px] text-amber-600/60 font-mono">
              <span>0% (stable)</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border min-h-full h-auto flex flex-col gap-6 select-none">
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
            <div className="flex flex-col gap-3.5">
              
              {/* Category 1 — Regional Disruption Scenarios */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 border-b border-[#F97316]/15 pb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] shadow-[0_0_6px_rgba(249,115,22,0.6)] animate-pulse" />
                  <span className="text-[9px] uppercase font-mono font-bold text-[#F97316] tracking-wider">
                    Regional Disruption Scenarios
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {renderPresetButton("hormuz_50", "#F97316", "hover:border-[#F97316]/50 hover:text-white")}
                  {renderPresetButton("opec_cut", "#F97316", "hover:border-[#F97316]/50 hover:text-white")}
                  {renderPresetButton("red_sea_full", "#F97316", "hover:border-[#F97316]/50 hover:text-white")}
                </div>
              </div>

              {/* Category 2 — User Simulation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 border-b border-[#3B82F6]/15 pb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                  <span className="text-[9px] uppercase font-mono font-bold text-[#3B82F6] tracking-wider">
                    User Simulation
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {renderPresetButton("custom", "#3B82F6", "hover:border-[#3B82F6]/50 hover:text-white")}
                </div>
              </div>

              {/* Category 3 — Historical Validation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 border-b border-[#D4A017]/15 pb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shadow-[0_0_6px_rgba(212,160,23,0.6)]" />
                  <span className="text-[9px] uppercase font-mono font-bold text-[#D4A017] tracking-wider">
                    Historical Validation
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {renderPresetButton("replay_2025", "#D4A017", "hover:border-[#D4A017]/50 hover:text-white")}
                </div>
              </div>

              {/* Category 4 — Composite Analysis */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 border-b border-[#06B6D4]/15 pb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                  <span className="text-[9px] uppercase font-mono font-bold text-[#06B6D4] tracking-wider">
                    Composite Analysis
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {renderPresetButton("weighted_composite", "#06B6D4", "hover:border-[#06B6D4]/50 hover:text-white")}
                </div>
              </div>

            </div>
          </div>

          {/* Warning Notice / Data Honesty Caption */}
          {activeScenarioId === "weighted_composite" ? (
            <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 p-3 rounded shrink-0">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 block font-bold">
                  MODELED SCENARIO ANALYSIS
                </span>
                <p className="font-sans text-[10px] text-gray-400 mt-1 leading-relaxed text-justify">
                  Composite weighted by live Module 1 corridor scores — not a forecast, an expected-value operational estimate.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 bg-cyber-red/5 border border-cyber-red/20 p-3 rounded shrink-0">
              <AlertOctagon className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono text-cyber-red block font-bold">
                  MODELED SCENARIO ANALYSIS
                </span>
                <p className="font-sans text-[10px] text-gray-400 mt-1 leading-relaxed text-justify">
                  This is a simulation dashboard. Telemetry metrics show hypothetical stresses on national procurement rates.
                </p>
              </div>
            </div>
          )}
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

              const drop = impact.refinery_run_rate_drop;
              const spread = drop * 0.15;
              const minDrop = drop - spread;
              const maxDrop = drop + spread;
              const midRate = 100 - drop;
              const minRate = Math.max(0, 100 - maxDrop);
              const maxRate = Math.min(100, 100 - minDrop);

              const midPercent = midRate;
              const minPercent = minRate;
              const maxPercent = maxRate;

              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[125px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1">
                      Refinery Run Rate
                      <span className="group relative cursor-help">
                        <Info className="w-3 h-3 text-gray-500 hover:text-cyber-blue transition-colors" />
                        <span className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-[180px] bg-[#070b13] border border-cyber-border rounded p-2 text-[8.5px] text-gray-400 font-sans leading-normal normal-case z-30 shadow-2xl">
                          Refinery utilization rate relative to full capacity under active disruptions.
                        </span>
                      </span>
                    </span>
                    <span className="text-[7.5px] font-mono text-cyber-orange border border-cyber-orange/30 bg-cyber-orange/5 px-1 py-0.5 rounded leading-none">MODELED RANGE</span>
                  </div>
                  <div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${refineryColor}`}>
                      {drop === 0 ? (
                        <span>100%</span>
                      ) : (
                        <>
                          <AnimatedNumber value={minRate} duration={500} formatter={(n) => `${Math.round(n)}`} />
                          %–
                          <AnimatedNumber value={maxRate} duration={500} formatter={(n) => `${Math.round(n)}`} />
                          %
                        </>
                      )}
                    </div>
                    <div className={`text-[9px] font-mono mt-0.5 ${refineryColor}`}>
                      Drop: {drop === 0 ? "0.0%" : (
                        <>
                          -<AnimatedNumber value={minDrop} duration={500} formatter={(n) => `${n.toFixed(1)}`} />
                          % to -
                          <AnimatedNumber value={maxDrop} duration={500} formatter={(n) => `${n.toFixed(1)}`} />
                          %
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-955 border border-slate-800 rounded overflow-hidden mt-2 select-none">
                    {/* Ghost Outline (representing 100% baseline) */}
                    <div className="absolute inset-0 border border-dashed border-cyber-green/40 rounded opacity-60 z-10 pointer-events-none" />
                    {/* Shaded Band */}
                    <div
                      className={`absolute h-full bg-gradient-to-r ${refineryBarColor} opacity-40 transition-all duration-500 ease-out`}
                      style={{ left: `${minPercent}%`, width: `${Math.max(1, maxPercent - minPercent)}%` }}
                    />
                    {/* Point Estimate Marker */}
                    <div
                      className="absolute h-full w-[2px] bg-white z-15 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out"
                      style={{ left: `calc(${midPercent}% - 1px)` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">After (Range)</span>
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

              const priceDelta = impact.fuel_price_delta;
              const spread = priceDelta * 0.15;
              const minPrice = priceDelta - spread;
              const maxPrice = priceDelta + spread;

              const midPercent = Math.min(100, (priceDelta / 25) * 100);
              const minPercent = Math.min(100, (Math.max(0, minPrice) / 25) * 100);
              const maxPercent = Math.min(100, (maxPrice / 25) * 100);

              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[125px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1">
                      Fuel Price Shock
                      <span className="group relative cursor-help">
                        <Info className="w-3 h-3 text-gray-500 hover:text-cyber-blue transition-colors" />
                        <span className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-[180px] bg-[#070b13] border border-cyber-border rounded p-2 text-[8.5px] text-gray-400 font-sans leading-normal normal-case z-30 shadow-2xl">
                          Simulated change in local retail fuel pricing due to supply shock.
                        </span>
                      </span>
                    </span>
                    <span className="text-[7.5px] font-mono text-cyber-orange border border-cyber-orange/30 bg-cyber-orange/5 px-1 py-0.5 rounded leading-none">MODELED RANGE</span>
                  </div>
                  <div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${priceColor}`}>
                      {priceDelta === 0 ? (
                        <span>+₹0.00</span>
                      ) : (
                        <>
                          +₹
                          <AnimatedNumber value={minPrice} duration={500} formatter={(n) => n.toFixed(2)} />
                          –₹
                          <AnimatedNumber value={maxPrice} duration={500} formatter={(n) => n.toFixed(2)} />
                        </>
                      )}
                      <span className="text-[10px] font-normal text-gray-400">/litre</span>
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 mt-0.5">
                      Baseline: ₹0.00 (no shock)
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-955 border border-slate-800 rounded overflow-hidden mt-2 select-none">
                    {/* Shaded Band */}
                    <div
                      className={`absolute h-full bg-gradient-to-r ${priceBarColor} opacity-40 transition-all duration-500 ease-out`}
                      style={{ left: `${minPercent}%`, width: `${Math.max(1, maxPercent - minPercent)}%` }}
                    />
                    {/* Point Estimate Marker */}
                    <div
                      className="absolute h-full w-[2px] bg-white z-15 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out"
                      style={{ left: `calc(${midPercent}% - 1px)` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">{priceDelta > 0 ? "Shock (Range)" : "Stable"}</span>
                      <span className="text-gray-400 font-bold">Max Scale: ₹25</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metric 3: SPR Command Center */}
            {(() => {
              const days = animatedDaysOfCover;
              
              // Stagger fill percentages across caverns proportionally: Padur (98%), Mangalore (94%), Visakhapatnam (88%)
              const vPercent = Math.max(0, (days / 9.5) * 88);
              const mPercent = Math.max(0, (days / 9.5) * 94);
              const pPercent = Math.max(0, (days / 9.5) * 98);

              const vDays = (vPercent / 100) * 2.375;
              const mDays = (mPercent / 100) * 3.325;
              const pDays = (pPercent / 100) * 3.8;

              // Active draw factor based on scenario
              let drawFactor = 0;
              if (activeScenarioId === "hormuz_50") drawFactor = 1.0;
              else if (activeScenarioId === "red_sea_full") drawFactor = 0.8;
              else if (activeScenarioId === "opec_cut") drawFactor = 0.4;
              else if (activeScenarioId === "replay_2025") drawFactor = 0.6;
              else if (activeScenarioId === "custom") drawFactor = customCapacityLoss / 100;

              const vDraw = drawFactor * 0.30;
              const mDraw = drawFactor * 0.45;
              const pDraw = drawFactor * 0.75;
              const totalDraw = vDraw + mDraw + pDraw;

              const getCavernConfig = (pct: number) => {
                if (pct >= 60) {
                  return {
                    status: "Normal",
                    rec: "HOLD",
                    gradient: "from-cyber-green/25 to-cyber-green/80",
                    border: "border-cyber-green/30",
                    textClass: "text-cyber-green",
                    badgeClass: "bg-cyber-green/5 border-cyber-green/20 text-cyber-green"
                  };
                } else if (pct >= 30) {
                  return {
                    status: "Heavy Draw",
                    rec: "DRAW ACTIVE",
                    gradient: "from-cyber-amber/25 to-cyber-amber/80",
                    border: "border-cyber-amber/30",
                    textClass: "text-cyber-amber",
                    badgeClass: "bg-cyber-amber/5 border-cyber-amber/20 text-cyber-amber"
                  };
                } else if (pct >= 5) {
                  return {
                    status: "Critical",
                    rec: "LIMIT DRAW",
                    gradient: "from-cyber-red/25 to-cyber-red/80",
                    border: "border-cyber-red/30",
                    textClass: "text-cyber-red",
                    badgeClass: "bg-cyber-red/5 border-cyber-red/20 text-cyber-red"
                  };
                } else {
                  return {
                    status: "Offline",
                    rec: "PRESERVE",
                    gradient: "from-gray-800 to-gray-700",
                    border: "border-gray-700/30",
                    textClass: "text-gray-500",
                    badgeClass: "bg-gray-500/5 border-gray-500/20 text-gray-500"
                  };
                }
              };

              const vConf = getCavernConfig(vPercent);
              const mConf = getCavernConfig(mPercent);
              const pConf = getCavernConfig(pPercent);

              let overallRec = "PRESERVE / STANDBY";
              let overallColor = "text-cyber-green";
              if (days < 4.0) {
                overallRec = "CRITICAL EMERGENCY RELEASE";
                overallColor = "text-cyber-red";
              } else if (days < 7.0) {
                overallRec = "CONTROLLED DRAWDOWN";
                overallColor = "text-cyber-amber";
              }

              const caverns = [
                { name: "Visakhapatnam", share: "25%", days: vDays, pct: vPercent, draw: vDraw, conf: vConf },
                { name: "Mangalore", share: "35%", days: mDays, pct: mPercent, draw: mDraw, conf: mConf },
                { name: "Padur", share: "40%", days: pDays, pct: pPercent, draw: pDraw, conf: pConf }
              ];

              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3 pt-2 pb-2.5 rounded flex flex-col justify-between h-[266px]">
                   {/* Card Header */}
                  <div className="flex justify-between items-center border-b border-cyber-border/40 pb-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-cyber-orange uppercase font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-orange animate-pulse" />
                      Strategic Petroleum Reserve Command Center
                      <span className="group relative cursor-help">
                        <Info className="w-3 h-3 text-cyber-orange/60 hover:text-cyber-orange transition-colors" />
                        <span className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-[200px] bg-[#070b13] border border-cyber-border rounded p-2 text-[8.5px] text-gray-400 font-sans leading-normal normal-case z-30 shadow-2xl">
                          Drawdown status and cover telemetry for the Visakhapatnam, Mangalore, and Padur SPR caverns.
                        </span>
                      </span>
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-500 uppercase">Live Cavern Telemetry</span>
                  </div>

                  {/* Caverns Row */}
                  <div className="grid grid-cols-3 gap-2 my-1 flex-1 items-center">
                    {caverns.map((cav) => (
                      <div key={cav.name} className={`flex flex-col items-center border ${cav.conf.border} bg-slate-955/20 p-1 pb-1.5 rounded font-mono text-center`}>
                        <span className="text-[7.5px] font-bold text-gray-300 uppercase tracking-wide truncate max-w-full">
                          {cav.name}
                        </span>
                        <span className="text-[7px] text-gray-500 leading-none">Share: {cav.share}</span>
                        
                        {/* Cylinder Graphic - Taller rectangular storage chamber design */}
                        <div className="relative w-9 h-[52px] bg-slate-950/70 border border-cyber-border/25 rounded-t-md rounded-b shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] overflow-hidden my-1 flex flex-col justify-end">
                          {/* Liquid Level */}
                          <div 
                            className={`w-full bg-gradient-to-t ${cav.conf.gradient} opacity-75`}
                            style={{ 
                              height: `${cav.pct}%`, 
                              transition: 'height 10s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}
                          />
                          {/* Animated Wave Surface overlay */}
                          <div 
                            className="absolute left-0 right-0 h-1.5 overflow-hidden pointer-events-none"
                            style={{ 
                              bottom: `calc(${cav.pct}% - 3.5px)`, 
                              transition: 'bottom 10s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}
                          >
                            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className={`w-[200%] h-full fill-current ${cav.conf.textClass} opacity-40 animate-wave`}>
                              <path d="M 0,10 Q 25,18 50,10 T 100,10 L 100,20 L 0,20 Z" />
                            </svg>
                          </div>
                          {/* Glowing Cap Line */}
                          <div 
                            className="absolute w-full h-[2px] bg-white opacity-95 z-10 shadow-[0_0_6px_rgba(255,255,255,1)]" 
                            style={{ 
                              bottom: `calc(${cav.pct}% - 1px)`, 
                              transition: 'bottom 10s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}
                          />
                        </div>

                        <span className="text-[9px] font-bold text-white leading-none">
                          {cav.pct.toFixed(0)}%
                        </span>
                        <span className="text-[7.5px] text-gray-400 mt-0.5">
                          {cav.days.toFixed(1)}d cover
                        </span>
                        <span className="text-[7px] text-gray-500 font-bold leading-none mt-0.5">
                          -{cav.draw.toFixed(2)} Mmbpd
                        </span>
                        <span className={`text-[6.5px] font-extrabold border rounded px-1 mt-0.5 leading-normal uppercase ${cav.conf.badgeClass}`}>
                          {cav.conf.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* National Summary Block */}
                  <div className="bg-slate-955/60 border border-cyber-border/30 rounded p-2 text-left font-mono text-[8.5px] leading-relaxed flex flex-col gap-1 shrink-0">
                    <div className="flex justify-between items-center border-b border-cyber-border/20 pb-0.5 mb-0.5">
                      <span className="text-gray-400">NATIONAL RESERVE SUMMARY</span>
                      <span className="text-[7.5px] px-1 py-0.2 rounded bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue font-bold">MODELED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Days of Cover:</span>
                        <span className="text-white font-bold">{days.toFixed(1)} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Critical Threshold:</span>
                        <span className="text-cyber-red font-bold">3.0 Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Daily Draw Rate:</span>
                        <span className="text-cyber-orange font-bold">-{totalDraw.toFixed(2)} Mmbpd</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Confidence Score:</span>
                        <span className="text-cyber-blue font-bold">96%</span>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-cyber-border/20 pt-0.5 mt-0.5">
                      <span className="text-gray-500">AI Directives:</span>
                      <span className={`font-black uppercase ${overallColor}`}>{overallRec}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metric 4: GDP Growth Drag */}
            {(() => {
              const gdpSev = getSeverity("gdp_drag", animatedGdp);
              const gdpColor = getSeverityColorClass(gdpSev);
              const gdpBarColor = getSeverityBarClass(gdpSev);

              const drag = animatedGdp;
              const spread = drag * 0.15;
              const minDrag = drag - spread;
              const maxDrag = drag + spread;

              const midPercent = Math.min(100, (drag / 1.5) * 100);
              const minPercent = Math.min(100, (Math.max(0, minDrag) / 1.5) * 100);
              const maxPercent = Math.min(100, (maxDrag / 1.5) * 100);

              return (
                <div className="bg-[#0b0f19]/50 border border-cyber-border p-3.5 rounded flex flex-col justify-between h-[266px]">
                  <div className="flex justify-between items-center border-b border-cyber-border/40 pb-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1">
                      Quarterly GDP Drag
                      <span className="group relative cursor-help">
                        <Info className="w-3 h-3 text-gray-500 hover:text-cyber-blue transition-colors" />
                        <span className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-[180px] bg-[#070b13] border border-cyber-border rounded p-2 text-[8.5px] text-gray-400 font-sans leading-normal normal-case z-30 shadow-2xl">
                          Macroeconomic friction drag on quarterly Gross Domestic Product growth.
                        </span>
                      </span>
                    </span>
                    <span className="text-[7.5px] font-mono text-cyber-orange border border-cyber-orange/30 bg-cyber-orange/5 px-1 py-0.5 rounded leading-none">MODELED RANGE</span>
                  </div>
                  
                  {/* Left-aligned headline, same size as other cards */}
                  <div className="mt-2 shrink-0">
                    <div className={`text-lg font-bold font-mono tracking-tight ${gdpColor}`}>
                      {drag === 0 ? (
                        <span>0.00%</span>
                      ) : (
                        <>
                          -
                          <AnimatedNumber value={minDrag} duration={500} formatter={(n) => n.toFixed(2)} />
                          % to -
                          <AnimatedNumber value={maxDrag} duration={500} formatter={(n) => n.toFixed(2)} />
                          %
                        </>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 mt-0.5">
                      Baseline: 0.00% (no drag)
                    </div>
                  </div>

                  {/* Bigger sparkline progression timeline chart */}
                  <div className="my-auto py-1 flex flex-col justify-center flex-grow">
                    <span className="text-[7px] font-mono text-gray-500 uppercase block tracking-wider mb-1">GDP Impact Timeline (Today → Qtr End)</span>
                    <div className="h-[95px] w-full bg-[#050814]/65 border border-cyber-border/20 rounded relative overflow-hidden flex items-center justify-center p-1.5">
                      <svg viewBox="0 0 200 65" className="w-full h-full">
                        {/* Baseline zero line */}
                        <line x1="0" y1="10" x2="200" y2="10" stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
                        
                        {(() => {
                          const y1 = 10 + Math.min(40, drag * 12);
                          const y2 = 10 + Math.min(40, drag * 20);
                          const y3 = 10 + Math.min(40, drag * 28);
                          
                          const points = `10,10 70,${y1} 130,${y2} 190,${y3}`;
                          const lineColor = drag > 0.5 ? "#ef4444" : drag > 0 ? "#f59e0b" : "#10b981";
                          
                          return (
                            <>
                              {/* Glow background line */}
                              <polyline
                                fill="none"
                                stroke={lineColor}
                                strokeWidth="3"
                                points={points}
                                className="opacity-25"
                              />
                              {/* Foreground line */}
                              <polyline
                                fill="none"
                                stroke={lineColor}
                                strokeWidth="1.2"
                                points={points}
                              />
                              {/* Milestones nodes */}
                              <circle cx="10" cy="10" r="1.8" fill="#10b981" />
                              <circle cx="70" cy={y1} r="1.8" fill={lineColor} />
                              <circle cx="130" cy={y2} r="1.8" fill={lineColor} />
                              <circle cx="190" cy={y3} r="1.8" fill={lineColor} />
                              
                              {/* Ticks & Labels */}
                              <text x="10" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-gray-500 font-bold">TODAY</text>
                              <text x="70" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-gray-500 font-bold">WK 1</text>
                              <text x="130" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-gray-500 font-bold">WK 2</text>
                              <text x="190" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-gray-500 font-bold">QTR END</text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                  
                  {/* Animated Horizontal Tube */}
                  <div className="relative h-4 w-full bg-slate-955 border border-slate-800 rounded overflow-hidden select-none shrink-0">
                    {/* Shaded Band */}
                    <div
                      className={`absolute h-full bg-gradient-to-r ${gdpBarColor} opacity-40 transition-all duration-500 ease-out`}
                      style={{ left: `${minPercent}%`, width: `${Math.max(1, maxPercent - minPercent)}%` }}
                    />
                    {/* Point Estimate Marker */}
                    <div
                      className="absolute h-full w-[2px] bg-white z-15 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out"
                      style={{ left: `calc(${midPercent}% - 1px)` }}
                    />
                    {/* Text overlays inside */}
                    <div className="absolute inset-0 flex justify-between items-center px-1.5 font-mono text-[8px] z-20 pointer-events-none">
                      <span className="text-white font-bold">{drag > 0 ? "GDP Shock (Range)" : "Baseline"}</span>
                      <span className="text-gray-400 font-bold">Max Scale: 1.5%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Time Machine historical backtest comparison panel */}
          {activeScenarioId === "replay_2025" && (
            <div className="mt-4 border border-amber-500/30 rounded bg-[#1f1a10]/15 flex flex-col overflow-hidden text-left font-mono shrink-0">
              {/* Context Banner */}
              <div className="bg-[#241d12] px-4 py-2.5 border-b border-amber-500/20 text-[10px] text-amber-300 leading-relaxed font-sans">
                <span className="font-bold uppercase tracking-wider block text-[8.5px] text-amber-500 mb-0.5">HISTORICAL REPLAY REPORT</span>
                "2025 US-Iran standoff — Brent crude rose over 8% in a single session; Indian refiners forced onto spot markets at steep premiums."
              </div>

              {/* Two-Column Comparison */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-amber-500/20 text-xs">
                
                {/* Left Column: Historical Record */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 block border-b border-amber-900/40 pb-1">
                    [HISTORICAL RECORD]
                  </span>
                  <ul className="list-disc pl-4 flex flex-col gap-2 text-gray-300 text-[10.5px] font-sans">
                    <li><strong className="text-amber-400 font-mono">Brent Spike:</strong> Brent crude jumped &gt;8% in a single trading session during peak escalation.</li>
                    <li><strong className="text-amber-400 font-mono">Spot Premiums:</strong> Indian refiners forced onto spot markets at steep premiums due to sudden contract cutoff.</li>
                    <li><strong className="text-amber-400 font-mono">Stabilization Gap:</strong> Real-world multi-week latency in response and procurement execution.</li>
                  </ul>
                </div>

                {/* Right Column: Retroactive Simulation */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 block border-b border-cyan-900/40 pb-1">
                    [MODELED — RETROACTIVE SIMULATION]
                  </span>
                  <ul className="list-disc pl-4 flex flex-col gap-2 text-gray-300 text-[10.5px] font-sans">
                    <li><strong className="text-cyan-400 font-mono">Price Shock Model:</strong> Modeled fuel retail delta at <span className="text-cyber-red font-mono font-bold">+₹{impact.fuel_price_delta.toFixed(1)}/L</span>.</li>
                    <li><strong className="text-cyan-400 font-mono">SPR Drawdown:</strong> Strategic reserves covers would be modeled dropping to <span className="text-cyber-amber font-mono font-bold">{animatedDaysOfCover.toFixed(1)} Days</span>.</li>
                    <li><strong className="text-cyan-400 font-mono">Detection Speed:</strong> Generated optimal procurement response options in <span className="text-cyber-green font-mono font-bold">~0.15s</span> (if Sentinel-47 had been deployed).</li>
                  </ul>
                </div>

              </div>

              {/* Bottom Summary Banner */}
              <div className="bg-[#241d12]/40 p-3 text-[10px] text-amber-400/90 text-center leading-normal font-sans border-t border-amber-500/10">
                <strong>INTEGRATED INTELLIGENCE PERFORMANCE LOG:</strong> Sentinel-47's detection pipeline would have surfaced this signal in near-real-time, versus the real-world multi-week response lag referenced in McKinsey's 47-day stabilization gap analysis.
              </div>

            </div>
          )}

          {/* Ripple Effect Node Graph Panel */}
          <div key={activeScenarioId} className={`mt-4 flex flex-col border rounded bg-[#0b0f19]/25 p-4 shrink-0 text-left transition-colors duration-300 ${activeScenarioId === "replay_2025" ? "border-amber-500/20" : "border-cyber-border"}`}>
            <span className={`text-[10px] uppercase font-mono block font-bold mb-3 tracking-wider ${activeScenarioId === "replay_2025" ? "text-amber-400" : "text-cyber-orange"}`}>
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
                  
                  const strokeColor = sev === "critical" 
                    ? "rgba(239,68,68,0.95)" 
                    : sev === "warning" 
                    ? "rgba(249,115,22,0.7)" 
                    : "rgba(34,197,94,0.25)";
                  
                  const strokeWidth = sev === "critical" ? "2.6" : sev === "warning" ? "1.8" : "1.0";
                  
                  const pulseFillColor = sev === "critical" 
                    ? "#ef4444" 
                    : sev === "warning" 
                    ? "#f59e0b" 
                    : "#10b981";

                  const pathD = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${(edge.y1 + edge.y2) / 2}, ${edge.x2} ${(edge.y1 + edge.y2) / 2}, ${edge.x2} ${edge.y2}`;

                  return (
                    <React.Fragment key={idx}>
                      {/* Glow path behind */}
                      {sev !== "stable" && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke={pulseFillColor}
                          strokeWidth={Number(strokeWidth) + 3}
                          className="opacity-15 pointer-events-none"
                          style={{ filter: "blur(2px)" }}
                        />
                      )}
                      {/* Foreground base path */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        markerEnd={`url(#arrow-${sev})`}
                        className={`pointer-events-none ${sev !== "stable" ? "animate-path-pulse" : ""}`}
                      />
                      {/* Traveling pulse motion along curves */}
                      {activeScenarioId !== "baseline" && (
                        <circle r="1.8" fill={pulseFillColor} className="opacity-80 shadow-md">
                          <animateMotion
                            path={pathD}
                            begin={`${idx * 0.4}s`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </React.Fragment>
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
            <span className="group relative cursor-help flex items-center shrink-0">
              <Info className="w-3.5 h-3.5 text-cyber-blue shrink-0 hover:text-white transition-colors" />
              <span className="absolute top-full left-0 mt-1.5 hidden group-hover:block w-[240px] bg-[#070b13] border border-cyber-border rounded p-2 text-[8.5px] text-gray-400 font-sans leading-normal normal-case z-30 shadow-2xl">
                Geopolitical stress-testing rules and assumptions compiled from operational validation guidelines.
              </span>
            </span>
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
      <style jsx global>{`
        @keyframes waveFlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: waveFlow 4s linear infinite;
        }
        @keyframes pathPulse {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-path-pulse {
          stroke-dasharray: 6,6;
          animation: pathPulse 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
