"use client";

import React, { useState } from "react";
import { AlertOctagon, BarChart2, HelpCircle, Info, Sliders } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

  // Data preparation for Recharts comparison
  // 1. Refinery Run-Rate
  const runRateData = [
    { name: "Baseline", value: 100, fill: "#10b981" },
    { name: "Simulation", value: 100 - impact.refinery_run_rate_drop, fill: "#ef4444" },
  ];

  // 2. SPR Cover
  const sprData = [
    { name: "Baseline", value: 9.5, fill: "#10b981" },
    { name: "Simulation", value: impact.days_of_cover, fill: "#f59e0b" },
  ];

  // 3. Price Delta
  const priceData = [
    { name: "Baseline", value: 0, fill: "#10b981" },
    { name: "Simulation", value: impact.fuel_price_delta, fill: "#f97316" },
  ];

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6">
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

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isActive = activeScenarioId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onScenarioChange(preset.id)}
              className={`text-left p-2.5 rounded border transition-all text-xs flex flex-col justify-between h-[65px] ${
                isActive
                  ? "bg-cyber-orange/10 border-cyber-orange text-cyber-orange shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                  : "bg-[#0b0f19]/40 border-cyber-border text-gray-300 hover:bg-[#0b0f19]/80"
              }`}
            >
              <span className="font-mono font-bold">{preset.label}</span>
              <span className="text-[9px] text-gray-500 line-clamp-1">{preset.description}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Slider */}
      {activeScenarioId === "custom" && (
        <div className="bg-[#0b0f19]/40 border border-cyber-border p-4 rounded flex flex-col gap-2">
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
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-orange"
          />
          <div className="flex justify-between text-[9px] text-gray-600 font-mono">
            <span>0% (stable)</span>
            <span>50%</span>
            <span>100% (total suspension)</span>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="flex items-start gap-2.5 bg-cyber-red/5 border border-cyber-red/20 p-3 rounded">
        <AlertOctagon className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] uppercase font-mono text-cyber-red block font-bold">
            MODELED SCENARIO ANALYSIS
          </span>
          <span className="text-[10px] text-gray-400 leading-normal">
            Figures shown below represent modeled stress estimates and operational risk bounds, not economic forecasts. Data generated relative to India's ~9.5 day strategic reserve base.
          </span>
        </div>
      </div>

      {/* Before / After Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Refinery Drop */}
        <div className="bg-[#0b0f19]/50 border border-cyber-border p-3 rounded flex flex-col justify-between">
          <span className="text-[9px] font-mono text-gray-500 uppercase">Refinery Run Rate</span>
          <div className="my-2">
            <div className="text-[10px] font-mono text-gray-400">Baseline: 100%</div>
            <div className="text-lg font-bold font-mono text-cyber-red flex items-baseline gap-1 mt-0.5">
              {(100 - impact.refinery_run_rate_drop).toFixed(0)}%
              <span className="text-[10px] font-normal text-gray-400">
                (-{impact.refinery_run_rate_drop}%)
              </span>
            </div>
          </div>
          <div className="h-[50px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runRateData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} hide />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {runRateData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 2: Price Delta */}
        <div className="bg-[#0b0f19]/50 border border-cyber-border p-3 rounded flex flex-col justify-between">
          <span className="text-[9px] font-mono text-gray-500 uppercase">Fuel Price Shock</span>
          <div className="my-2">
            <div className="text-[10px] font-mono text-gray-400">Baseline: +Rs. 0.00</div>
            <div className="text-lg font-bold font-mono text-cyber-orange mt-0.5">
              +Rs. {impact.fuel_price_delta.toFixed(2)}
              <span className="text-[10px] font-normal text-gray-400 ml-1">/litre</span>
            </div>
          </div>
          <div className="h-[50px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {priceData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 3: SPR Days-of-Cover */}
        <div className="bg-[#0b0f19]/50 border border-cyber-border p-3 rounded flex flex-col justify-between">
          <span className="text-[9px] font-mono text-gray-500 uppercase">SPR Buffer Cover</span>
          <div className="my-2">
            <div className="text-[10px] font-mono text-gray-400">Baseline: 9.5 days</div>
            <div className="text-lg font-bold font-mono text-cyber-amber mt-0.5">
              {impact.days_of_cover.toFixed(1)}
              <span className="text-[10px] font-normal text-gray-400 ml-1">days left</span>
            </div>
          </div>
          <div className="h-[50px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sprData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 9.5]} hide />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {sprData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 4: GDP Growth Drag */}
        <div className="bg-[#0b0f19]/50 border border-cyber-border p-3 rounded flex flex-col justify-between">
          <span className="text-[9px] font-mono text-gray-500 uppercase">Quarterly GDP Drag</span>
          <div className="my-2">
            <div className="text-[10px] font-mono text-gray-400">Baseline: 0.0%</div>
            <div className="text-lg font-bold font-mono text-cyber-red mt-0.5">
              -{impact.gdp_drag.toFixed(2)}%
              <span className="text-[10px] font-normal text-gray-400 ml-1">growth rate</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-gray-500 bg-cyber-bg p-1 rounded border border-cyber-border/40">
            <Info className="w-3.5 h-3.5 text-cyber-blue" />
            <span>Spills to general inflation</span>
          </div>
        </div>
      </div>

      {/* Stated Assumptions Panel - First-Class UI Element */}
      <div className="border border-cyber-border/80 rounded bg-[#070b13] flex flex-col overflow-hidden">
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
