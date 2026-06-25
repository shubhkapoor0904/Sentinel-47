"use client";

import React, { useState } from "react";
import { Anchor, ArrowRight, Brain, Clock, ShieldCheck, Ship, Tag } from "lucide-react";

interface ProcurementOption {
  name: string;
  source: string;
  pricePremium: number;
  transitDays: number;
  portCongestion: "Low" | "Medium" | "High";
  compatibility: number;
  overallScore: number;
  reasoning: string;
}

interface ProcurementOrchestratorProps {
  options: ProcurementOption[];
  isLoading: boolean;
}

export default function ProcurementOrchestrator({ options, isLoading }: ProcurementOrchestratorProps) {
  const [selectedRoute, setSelectedRoute] = useState<number | null>(0);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-cyber-green border-cyber-green/30 bg-cyber-green/5";
    if (score >= 70) return "text-cyber-amber border-cyber-amber/30 bg-cyber-amber/5";
    return "text-cyber-red border-cyber-red/30 bg-cyber-red/5";
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-cyber-red bg-cyber-red/10 border-cyber-red/20";
      case "Medium":
        return "text-cyber-amber bg-cyber-amber/10 border-cyber-amber/20";
      case "Low":
      default:
        return "text-cyber-green bg-cyber-green/10 border-cyber-green/20";
    }
  };

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              3. Adaptive Procurement Orchestrator
            </h2>
            <p className="text-[11px] text-gray-400">
              Agent-ranked alternative sourcing channels and transit logs
            </p>
          </div>
        </div>
      </div>

      {/* Model Honesty Banner */}
      <div className="bg-[#0b0f19]/40 border border-cyber-border/50 p-2 px-3 rounded flex items-center justify-between text-[9px] font-mono text-gray-500">
        <span>LOGISTICS PORT CONGESTION: MODELED ILLUSTRATIVE DATA</span>
        <span className="text-cyber-blue font-bold">UPDATED: REAL-TIME APPLIED DISRUPTION</span>
      </div>

      {/* Main List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[360px] pr-1 mt-1">
        {options.map((opt, idx) => {
          const isSelected = selectedRoute === idx;
          const scoreColor = getScoreColor(opt.overallScore);

          return (
            <div
              key={idx}
              onClick={() => setSelectedRoute(idx)}
              className={`p-4 rounded border cursor-pointer transition-all text-left flex flex-col gap-3 ${
                isSelected
                  ? "bg-cyber-blue/5 border-cyber-blue shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-[#0b0f19]/40 border-cyber-border/60 hover:bg-[#0b0f19]/80 hover:border-gray-700"
              }`}
            >
              {/* Row Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-mono font-bold text-gray-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                      {opt.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-sans flex items-center gap-1 mt-0.5">
                      <Anchor className="w-3 h-3 text-gray-500" /> Source: {opt.source}
                    </span>
                  </div>
                </div>

                <div className={`px-2 py-1 rounded border text-xs font-mono font-extrabold flex flex-col items-center justify-center min-w-[50px] ${scoreColor}`}>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-normal">Score</span>
                  {opt.overallScore}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cyber-bg/40 p-2.5 rounded border border-cyber-border/40 text-[10px] font-mono">
                {/* Price Premium */}
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-cyber-blue" />
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px]">Premium</span>
                    <span className={`font-semibold ${opt.pricePremium <= 0 ? "text-cyber-green" : "text-white"}`}>
                      {opt.pricePremium === 0
                        ? "N/A"
                        : opt.pricePremium < 0
                        ? `-$${Math.abs(opt.pricePremium).toFixed(2)}/bbl`
                        : `+$${opt.pricePremium.toFixed(2)}/bbl`}
                    </span>
                  </div>
                </div>

                {/* Transit Days */}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyber-blue" />
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px]">Transit</span>
                    <span className="text-white font-semibold">{opt.transitDays} Days</span>
                  </div>
                </div>

                {/* Congestion */}
                <div className="flex items-center gap-2">
                  <Ship className="w-3.5 h-3.5 text-cyber-blue" />
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px]">Congestion</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${getCongestionColor(opt.portCongestion)}`}>
                      {opt.portCongestion.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Compatibility */}
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyber-blue" />
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px]">Refinery Match</span>
                    <span className="text-white font-semibold">{opt.compatibility}%</span>
                  </div>
                </div>
              </div>

              {/* Chain of Thought Reasoning Panel */}
              {isSelected && (
                <div className="border-t border-cyber-border/50 pt-3 mt-1 flex flex-col gap-1.5">
                  <span className="text-[8px] tracking-wider text-cyber-blue font-mono font-bold uppercase flex items-center gap-1">
                    <Brain className="w-3 h-3 text-cyber-blue animate-pulse" />
                    Agentic Reasoning & Strategic Justification
                  </span>
                  <div className="bg-[#050814] p-3 border border-cyber-border/60 rounded text-[10px] font-mono text-gray-300 leading-relaxed italic">
                    {opt.reasoning}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
