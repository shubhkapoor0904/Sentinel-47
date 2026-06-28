"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, Shield, TrendingUp } from "lucide-react";
import RiskMap from "./RiskMap";
import AnimatedNumber from "./AnimatedNumber";

interface GeopoliticalSignal {
  id: string;
  corridor: "Hormuz" | "Red Sea" | "Suez" | "Global";
  event_type: string;
  severity_0to10: number;
  confidence: number;
  source: string;
  timestamp: string;
  reasoning: string;
  headline: string;
}

interface CorridorState {
  name: string;
  score: number;
  status: "STABLE" | "WARNING" | "CRITICAL";
  description: string;
}

interface RiskIntelligenceProps {
  corridors: {
    Hormuz?: CorridorState;
    "Red Sea"?: CorridorState;
    Suez?: CorridorState;
  };
  signals: GeopoliticalSignal[];
  brentPrice: number;
  brentSource: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function RiskIntelligence({
  corridors,
  signals,
  brentPrice,
  brentSource,
  isLoading,
  onRefresh,
}: RiskIntelligenceProps) {
  const [activeCorridor, setActiveCorridor] = useState<string | null>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "CRITICAL":
        return "text-cyber-red border-cyber-red/30 bg-cyber-red/5";
      case "WARNING":
        return "text-cyber-amber border-cyber-amber/30 bg-cyber-amber/5";
      case "STABLE":
      default:
        return "text-cyber-green border-cyber-green/30 bg-cyber-green/5";
    }
  };

  const getStatusBorder = (status?: string) => {
    switch (status) {
      case "CRITICAL":
        return "border-cyber-red/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
      case "WARNING":
        return "border-cyber-amber/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      case "STABLE":
      default:
        return "border-cyber-green/30";
    }
  };

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              1. Geopolitical Risk Intelligence Agent
            </h2>
            <p className="text-[11px] text-gray-400">
              Live threat parsing and corridor probability score models
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue hover:text-white rounded border border-cyber-blue/30 transition-all text-xs font-mono disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "POLLING..." : "REFRESH"}
        </button>
      </div>

      {/* Grid wrapper for map vs news feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Side: Map & pricing (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Telemetry Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cyber-bg/50 border border-cyber-border/50 p-4 rounded shrink-0">
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-500 block">
                Quantitative Baseline
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold font-mono text-white">
                  <AnimatedNumber value={brentPrice} duration={500} formatter={(n) => `$${n.toFixed(2)}`} />/bbl
                </span>
                <span className="text-[10px] font-mono text-cyber-blue flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Brent Crude
                </span>
              </div>
            </div>
            <div className="sm:border-l sm:border-cyber-border/50 sm:pl-4">
              <span className="text-[10px] uppercase font-mono text-gray-500 block">
                Data Integrity Log
              </span>
              <div className="mt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue uppercase">
                  LIVE DATA: {brentSource}
                </span>
              </div>
            </div>
          </div>

          {/* Corridor Summary Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {(["Hormuz", "Red Sea", "Suez"] as const).map((key) => {
              const stats = corridors[key] || {
                name: key,
                score: 15,
                status: "STABLE" as const,
                description: "",
              };
              const isSelected = activeCorridor === key;

              return (
                <div
                  key={key}
                  onClick={() => setActiveCorridor(isSelected ? null : key)}
                  className={`cursor-pointer border p-3 rounded bg-[#0b0f19]/40 hover:bg-[#0b0f19]/80 transition-all ${
                    isSelected ? "border-cyber-blue shadow-[0_0_10px_rgba(6,182,212,0.15)] bg-cyber-blue/5" : getStatusBorder(stats.status)
                  }`}
                >
                  <span className="text-[9px] font-mono uppercase text-gray-400 block truncate">
                    {key} Corridor
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold font-mono text-white">
                      <AnimatedNumber value={stats.score} duration={500} formatter={(n) => `${Math.round(n)}%`} />
                    </span>
                    <span className={`text-[8px] font-mono px-1 rounded ${getStatusColor(stats.status)}`}>
                      {stats.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Embedding SVG map (Make it taller for screen layouts) */}
          <div className="flex-1 min-h-[360px] lg:min-h-[420px] relative">
            <RiskMap
              corridors={corridors}
              activeCorridor={activeCorridor}
              onSelectCorridor={setActiveCorridor}
            />
          </div>
        </div>

        {/* Right Side: scrolling signal feed (col-span-1) */}
        <div className="lg:col-span-1 flex flex-col border border-cyber-border rounded overflow-hidden min-h-[300px] h-full bg-[#0b0f19]/25">
          <div className="bg-[#0b0f19] px-3 py-2 border-b border-cyber-border flex items-center justify-between shrink-0">
            <span className="text-[9px] font-mono text-gray-400 flex items-center gap-1.5 uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
              Live Threat Signal Extraction
            </span>
            <span className="text-[9px] font-mono text-gray-500">
              POLLING: ACTIVE (60S)
            </span>
          </div>

          {/* Signal feed terminal box - fills the rest of the sidebar container height */}
          <div 
            id="threat-signal-feed"
            className="bg-cyber-bg/50 p-4 font-mono text-xs flex-1 flex flex-col gap-3"
          >
            {signals.map((sig) => {
              const isCorridorSelected = activeCorridor === sig.corridor;
              return (
                <div
                  key={sig.id}
                  id={`feed-sig-${sig.id}`}
                  className={`border-l-2 pl-3 py-2 transition-all duration-300 text-left ${
                    isCorridorSelected
                      ? "border-cyber-blue bg-cyber-blue/10 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]"
                      : sig.corridor === "Hormuz"
                      ? "border-cyber-red bg-cyber-red/5"
                      : sig.corridor === "Red Sea"
                      ? "border-cyber-orange bg-cyber-orange/5"
                      : sig.corridor === "Suez"
                      ? "border-cyber-amber bg-cyber-amber/5"
                      : "border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] text-gray-400 font-bold">
                      [{sig.source.toUpperCase()}] {new Date(sig.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold ${
                        sig.severity_0to10 >= 6.5
                          ? "bg-cyber-red/20 text-cyber-red border border-cyber-red/30"
                          : sig.severity_0to10 >= 4.0
                          ? "bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/30"
                          : "bg-cyber-green/20 text-cyber-green border border-cyber-green/30"
                      }`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5 animate-pulse" /> SEV: {sig.severity_0to10}/10
                    </span>
                  </div>
                  <h4 className="text-[11px] text-white font-semibold mt-1 leading-snug">
                    {sig.headline}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed italic">
                    Agent Assessment: {sig.reasoning}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="text-[9px] text-cyber-blue uppercase font-bold">
                      Corridor: {sig.corridor}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      Conf: {Math.round(sig.confidence * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
