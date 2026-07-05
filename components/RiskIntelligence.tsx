"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, RefreshCw, Shield, TrendingUp, Ship, Info } from "lucide-react";
import RiskMap from "./RiskMap";
import AnimatedNumber from "./AnimatedNumber";
import { useSentinelStore } from "../store/sentinel";

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
  isLoading: boolean;
  onRefresh: () => void;
}

export default function RiskIntelligence({
  isLoading,
  onRefresh,
}: RiskIntelligenceProps) {
  const {
    corridorScores,
    signals,
    brentPrice,
    brentSource,
  } = useSentinelStore();

  const [activeCorridor, setActiveCorridor] = useState<string | null>(null);

  // Reconstruct detailed corridors object from corridorScores
  const corridors = useMemo(() => {
    const getStatus = (score: number) => {
      if (score >= 65) return "CRITICAL";
      if (score >= 35) return "WARNING";
      return "STABLE";
    };

    return {
      Hormuz: {
        name: "Strait of Hormuz",
        score: corridorScores.hormuz,
        status: getStatus(corridorScores.hormuz) as "STABLE" | "WARNING" | "CRITICAL",
        description: "Controls 40%+ of Indian crude imports.",
      },
      "Red Sea": {
        name: "Red Sea / Bab-el-Mandeb",
        score: corridorScores.redSea,
        status: getStatus(corridorScores.redSea) as "STABLE" | "WARNING" | "CRITICAL",
        description: "Primary lane for imports from Europe/US & exports.",
      },
      Suez: {
        name: "Suez Canal",
        score: corridorScores.suez,
        status: getStatus(corridorScores.suez) as "STABLE" | "WARNING" | "CRITICAL",
        description: "Vessel transit flow route for Russian crude imports.",
      },
    };
  }, [corridorScores]);

  // Auto-scroll to matching headline in Live Threat Feed when activeCorridor changes
  useEffect(() => {
    if (activeCorridor) {
      const matchedSig = signals.find((sig) => sig.corridor === activeCorridor);
      if (matchedSig) {
        const element = document.getElementById(`feed-sig-${matchedSig.id}`);
        const feedContainer = document.getElementById("threat-signal-feed");
        if (element && feedContainer) {
          const elementOffsetTop = element.offsetTop;
          const containerOffsetTop = feedContainer.offsetTop;
          feedContainer.scrollTo({
            top: elementOffsetTop - containerOffsetTop - 12,
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeCorridor, signals]);

  // Resolve active dark fleet vessels
  const darkFleetVessels = activeCorridor
    ? darkFleetDatabase[activeCorridor as "Hormuz" | "Red Sea" | "Suez"] || []
    : Object.values(darkFleetDatabase).flat();

  // Determine if active corridor (or any corridor) is in Warning/Critical state
  const isHighRisk = activeCorridor
    ? (corridors[activeCorridor as "Hormuz" | "Red Sea" | "Suez"]?.status === "WARNING" ||
       corridors[activeCorridor as "Hormuz" | "Red Sea" | "Suez"]?.status === "CRITICAL")
    : Object.values(corridors).some((c) => c?.status === "WARNING" || c?.status === "CRITICAL");

  const borderHighlightClass = isHighRisk
    ? "border-cyber-orange/60 shadow-[0_0_15px_rgba(249,115,22,0.08)] bg-cyber-orange/[0.01]"
    : "border-cyber-border bg-[#0b0f19]/25";

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

        {/* Right Side: scrolling signal feeds (col-span-1) */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-[500px]">
          
          {/* Card 1: Live News Feed */}
          <div className="flex-1 flex flex-col border border-cyber-border rounded overflow-hidden bg-[#0b0f19]/25 min-h-[220px]">
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
              className="bg-cyber-bg/50 p-4 font-mono text-xs flex-1 overflow-y-auto flex flex-col gap-3"
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

          {/* Card 2: Dark Fleet Feed */}
          <div className={`flex-1 flex flex-col border rounded overflow-hidden min-h-[220px] transition-all duration-300 ${borderHighlightClass}`}>
            <div className="bg-[#0b0f19] px-3 py-2 border-b border-cyber-border flex items-center justify-between shrink-0">
              <span className="text-[9px] font-mono text-gray-400 flex items-center gap-1.5 uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-orange animate-pulse" />
                Dark Fleet Signal — Modeled/Illustrative Data
              </span>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-cyber-orange transition-all" />
                <div className="absolute right-0 top-6 w-[280px] bg-slate-955 border border-cyber-border rounded p-3 text-[10px] text-gray-400 font-mono leading-relaxed hidden group-hover:block group-focus:block z-30 shadow-2xl">
                  Dark fleet detection identifies vessels disabling AIS transponders to evade tracking near high-risk corridors — often preceding reported incidents.
                </div>
              </div>
            </div>

            {/* Dark fleet list container */}
            <div 
              id="dark-fleet-vessels-feed"
              className="bg-cyber-bg/50 p-4 font-mono text-xs flex-1 overflow-y-auto flex flex-col gap-3.5"
            >
              {darkFleetVessels.length > 0 ? (
                darkFleetVessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className="border-b border-cyber-border/40 pb-2.5 last:border-b-0 last:pb-0 text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] text-white font-bold flex items-center gap-1">
                        <Ship className="w-3.5 h-3.5 text-cyber-orange" /> {vessel.id}
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyber-orange/10 border border-cyber-orange/20 text-cyber-orange font-bold uppercase tracking-wider">
                        AIS LOST
                      </span>
                    </div>
                    <div className="text-[9px] text-gray-400 font-sans mt-0.5">
                      <span className="text-gray-500 font-mono">Type:</span> {vessel.type}
                    </div>
                    <div className="text-[9px] text-gray-400 font-sans mt-0.5">
                      <span className="text-gray-500 font-mono">Last Known:</span> {vessel.lastKnown}
                    </div>
                    <div className="text-[9px] text-cyber-red font-mono mt-0.5">
                      <span className="text-gray-500">Loss Time:</span> {vessel.lostTime}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 italic border-l border-cyber-orange/40 pl-2 leading-relaxed">
                      Assessment: {vessel.assessment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-gray-500 italic text-center py-8">
                  No silent vessels flagged in this corridor.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Mock database for pre-disruption Dark Fleet vessel AIS tracking
const darkFleetDatabase = {
  Hormuz: [
    {
      id: "TANKER-VLCC-HRZ-089",
      type: "Crude Oil Tanker (VLCC) — Hormuz-bound",
      lastKnown: "26.34° N, 56.25° E (Strait of Hormuz)",
      lostTime: "Lost 2h 14m ago",
      assessment: "Pattern consistent with pre-disruption positioning — went dark shortly after entering the Strait."
    },
    {
      id: "TANKER-SUEZ-GOM-104",
      type: "Suezmax Crude Tanker — Gulf of Oman transit",
      lastKnown: "25.80° N, 57.10° E (Gulf of Oman)",
      lostTime: "Lost 4h 05m ago",
      assessment: "AIS spoofing detected; vessel transmitting conflicting location telemetry while running silent."
    }
  ],
  "Red Sea": [
    {
      id: "TANKER-AFRA-RDS-214",
      type: "Aframax Crude Carrier — Bab-el-Mandeb transit",
      lastKnown: "12.80° N, 43.15° E (Bab-el-Mandeb)",
      lostTime: "Lost 1h 45m ago",
      assessment: "Sudden transponder deactivation. Follows pattern of pre-disruption corridor positioning."
    },
    {
      id: "TANKER-VLCC-SRD-702",
      type: "Crude Oil Tanker (VLCC) — Saudi-bound",
      lastKnown: "14.50° N, 42.80° E (Southern Red Sea)",
      lostTime: "Lost 6h 12m ago",
      assessment: "Vessel disabled AIS transponder in high-threat corridor segment."
    }
  ],
  Suez: [
    {
      id: "TANKER-LPG-SUEZ-098",
      type: "LPG Carrier — Suez Canal convoy",
      lastKnown: "29.96° N, 32.55° E (Suez Canal Entrance)",
      lostTime: "Lost 3h 30m ago",
      assessment: "Signal lost at southern entrance. Anomalous route deviation registered prior to signal cutoff."
    },
    {
      id: "TANKER-VLCC-MED-044",
      type: "Crude Oil Tanker (VLCC) — Mediterranean transit",
      lastKnown: "31.25° N, 32.30° E (Port Said)",
      lostTime: "Lost 8h 05m ago",
      assessment: "AIS transmission cut off while queueing for southbound convoy transit."
    }
  ]
};
