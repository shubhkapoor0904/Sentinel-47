"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Anchor, Brain, Clock, ShieldCheck, Ship, Tag, DollarSign, Shield, ChevronDown, ChevronUp } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { useSentinelStore } from "../store/sentinel";

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
  isLoading: boolean;
  visibleCount?: number;
}

export default function ProcurementOrchestrator({ 
  isLoading,
  visibleCount
}: ProcurementOrchestratorProps) {
  const { rankedOptions, activeInterventions, activeScenarioId } = useSentinelStore();

  // Apply response intervention adjustments dynamically
  const options = useMemo(() => {
    if (!rankedOptions) return [];

    return rankedOptions.map((opt) => {
      let premium = opt.pricePremium;
      let transit = opt.transitDays;
      let congestion = opt.portCongestion;
      let compatibility = opt.compatibility;
      let score = opt.overallScore;
      let reasoning = opt.reasoning;

      // 1. Deploy Navy Escorts
      if (activeInterventions.navyEscorts) {
        if (opt.name.includes("Russian Urals") && activeScenarioId === "red_sea_full") {
          transit = 22;
          premium = Math.max(-2.8, premium - 0.80);
          score = Math.min(100, score + 12);
          reasoning = "INTERVENTION ACTIVE: Naval convoy escort (Operation Sankalp) stabilizes Red Sea transit lanes, shortening Cape reroute delay by 12 days and lowering insurance premiums.";
        } else if (opt.name.includes("North Sea") && activeScenarioId === "red_sea_full") {
          transit = 34;
          premium = Math.max(4.1, premium - 1.00);
          score = Math.min(100, score + 10);
          reasoning = "INTERVENTION ACTIVE: Armed escorts secure Suez-bound tankers, saving 10 days of Cape transit detour.";
        }
      }

      // 2. Release Emergency SPR Reserves
      if (activeInterventions.sprRelease) {
        if (opt.name.includes("Strategic Petroleum Reserve")) {
          score = 100;
          reasoning = "INTERVENTION ACTIVE: Coordinated emergency release from Visakhapatnam and Padur is currently injecting crude directly to Jamnagar and domestic refineries.";
        }
      }

      // 3. Bilateral OPEC Negotiation
      if (activeInterventions.opecNegotiation) {
        if (opt.name.includes("West African") || opt.source.includes("Persian Gulf") || opt.name.includes("Brent")) {
          premium = Math.max(0.2, premium - 0.90);
          score = Math.min(100, score + 8);
          reasoning = "INTERVENTION ACTIVE: Bilateral OPEC negotiations successfully secure term-contract volume pricing, offsetting regional spot market premiums.";
        }
      }

      return {
        ...opt,
        pricePremium: premium,
        transitDays: transit,
        portCongestion: congestion,
        compatibility,
        overallScore: score,
        reasoning
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [rankedOptions, activeInterventions, activeScenarioId]);

  const [selectedRoute, setSelectedRoute] = useState<number | null>(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Trigger staggered debate reveal animation when options change
  useEffect(() => {
    setAnimationStep(0);
    if (!options || options.length === 0) return;

    const timer1 = setTimeout(() => {
      setAnimationStep(1);
    }, 300);

    const timer2 = setTimeout(() => {
      setAnimationStep(2);
    }, 600);

    const timer3 = setTimeout(() => {
      setAnimationStep(3);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [options]);

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

  const formatPremium = (val: number, name: string) => {
    const isSpr = name.toLowerCase().includes("spr") || name.toLowerCase().includes("strategic");
    if (isSpr || val === 0) return "₹0/bbl";
    const usdStr = val < 0 ? `-$${Math.abs(val).toFixed(2)}/bbl` : `+$${val.toFixed(2)}/bbl`;
    const inrVal = val * 83; // 1 USD = 83 INR
    const inrStr = val < 0 ? `-₹${Math.abs(inrVal).toFixed(2)}/bbl` : `+₹${inrVal.toFixed(2)}/bbl`;
    return `${usdStr} (${inrStr})`;
  };

  const visibleLimit = visibleCount !== undefined ? visibleCount : options.length;

  // Stakeholder Agents dynamically generated evaluations
  let costPick = options[0];
  let securityPick = options[0];
  let minPremium = 0;
  let minTransit = 0;

  if (options && options.length > 0) {
    minPremium = options[0].pricePremium;
    minTransit = options[0].transitDays;

    options.forEach((opt) => {
      if (opt.pricePremium < minPremium) {
        minPremium = opt.pricePremium;
      }
      if (opt.transitDays < minTransit) {
        minTransit = opt.transitDays;
      }
    });

    const costOpts = options.filter((opt) => opt.pricePremium === minPremium);
    costPick = costOpts.sort((a, b) => b.overallScore - a.overallScore)[0] || options[0];

    const securityOpts = options.filter((opt) => opt.transitDays === minTransit);
    securityPick = securityOpts.sort((a, b) => b.overallScore - a.overallScore)[0] || options[0];
  }

  const consensusPick = options[0];
  const isAgreed = costPick && securityPick && costPick.name === securityPick.name;

  let consensusStance = "";
  if (consensusPick && costPick && securityPick) {
    if (isAgreed) {
      consensusStance = `CONSENSUS: ${consensusPick.name} — Both agents independently converge on the same optimal choice. Final ranking below reflects this alignment.`;
    } else if (consensusPick.name === securityPick.name) {
      consensusStance = `CONSENSUS: ${consensusPick.name} — Security Agent's concern outweighs Cost Agent's preference given active corridor risk. Final ranking below reflects this trade-off.`;
    } else if (consensusPick.name === costPick.name) {
      consensusStance = `CONSENSUS: ${consensusPick.name} — Cost Agent's premium savings outweigh Security Agent's exposure concerns under current market parameters. Final ranking below reflects this trade-off.`;
    } else {
      consensusStance = `CONSENSUS: ${consensusPick.name} — System balanced Cost Agent's preference for ${costPick.name} against Security Agent's safety focus on ${securityPick.name}. Final ranking below reflects this compromise.`;
    }
  }

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6 select-none">
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
      <div className="bg-[#0b0f19]/40 border border-cyber-border/50 p-2.5 px-3 rounded flex items-center justify-between text-[9px] font-mono text-gray-500">
        <span>LOGISTICS PORT CONGESTION: MODELED ILLUSTRATIVE DATA</span>
        <span className="text-cyber-blue font-bold font-semibold uppercase">UPDATED: REAL-TIME APPLIED DISRUPTION</span>
      </div>

      {/* Scrollable Layout Container */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-1 pr-1">
        
        {/* Agentic Reasoning / Debate Panel */}
        {options && options.length > 0 && (
          <div className="border border-cyber-border/80 bg-cyber-card/30 rounded p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] tracking-wider text-cyber-blue font-mono font-bold uppercase flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
                AGENTIC REASONING — SIMULATED STAKEHOLDER PRIORITIES
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-white transition-colors p-0.5 rounded hover:bg-gray-800"
              >
                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col gap-3.5">
                {/* Columns for Cost Agent and Security Agent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cost Agent */}
                  <div
                    className={`flex flex-col gap-2.5 p-3.5 rounded border border-cyber-blue/20 bg-cyber-blue/5 transition-all duration-500 transform ${
                      animationStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 border-b border-cyber-blue/15 pb-1.5">
                      <div className="w-4.5 h-4.5 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
                        <DollarSign className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[8.5px] font-mono font-bold text-cyber-blue uppercase tracking-wider">
                        COST AGENT (MINIMIZE PREMIUM)
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {options.slice(0, Math.min(3, options.length)).map((opt, idx) => {
                        const isLowest = opt.pricePremium === minPremium;
                        const premiumStr = formatPremium(opt.pricePremium, opt.name);
                        let stance = "";
                        if (isLowest) {
                          stance = `Recommend ${opt.name} — lowest premium at ${premiumStr}.`;
                        } else if (opt.name.toLowerCase().includes("spr") || opt.name.toLowerCase().includes("strategic") || opt.pricePremium === 0) {
                          stance = `Favor ${opt.name} — stable pricing at ${premiumStr}.`;
                        } else if (opt.pricePremium < 0) {
                          stance = `Recommend ${opt.name} — excellent discount at ${premiumStr}.`;
                        } else {
                          stance = `Accept ${opt.name} — premium is ${premiumStr}.`;
                        }
                        return (
                          <div key={idx} className="text-[10px] font-mono text-gray-300 border-l-2 border-cyber-blue/30 pl-2 leading-relaxed italic">
                            "{stance}"
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security Agent */}
                  <div
                    className={`flex flex-col gap-2.5 p-3.5 rounded border border-cyber-amber/20 bg-cyber-amber/5 transition-all duration-500 transform ${
                      animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 border-b border-cyber-amber/15 pb-1.5">
                      <div className="w-4.5 h-4.5 rounded-full bg-cyber-amber/10 border border-cyber-amber/30 flex items-center justify-center text-cyber-amber">
                        <Shield className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[8.5px] font-mono font-bold text-cyber-amber uppercase tracking-wider">
                        SECURITY & SPEED AGENT (MINIMIZE TRANSIT)
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {options.slice(0, Math.min(3, options.length)).map((opt, idx) => {
                        const isSpr = opt.name.toLowerCase().includes("spr") || opt.name.toLowerCase().includes("strategic");
                        let stance = "";
                        
                        if (isSpr || opt.transitDays <= 3) {
                          stance = `Favor ${opt.name} — only option bypassing all active threat corridors with ${opt.transitDays}-day local delivery.`;
                        } else if (opt.name.includes("West African")) {
                          stance = `Reject ${opt.name} — ${opt.transitDays}-day transit unacceptable given active Red Sea hostilities.`;
                        } else if (opt.name.includes("US") || opt.name.includes("Midland")) {
                          stance = `Reject ${opt.name} — ${opt.transitDays}-day transit creates highest geopolitical risk exposure.`;
                        } else if (opt.name.includes("Russian")) {
                          stance = `Reject ${opt.name} — ${opt.transitDays}-day detour around Cape of Good Hope adds critical supply lags.`;
                        } else if (opt.transitDays > 20) {
                          stance = `Reject ${opt.name} — excessive ${opt.transitDays}-day transit is unacceptable during active shipping corridor disruptions.`;
                        } else {
                          stance = `Accept ${opt.name} as secondary co-source — ${opt.transitDays}-day transit is manageable with ${opt.portCongestion.toLowerCase()} port congestion.`;
                        }
                        
                        return (
                          <div key={idx} className="text-[10px] font-mono text-gray-300 border-l-2 border-cyber-amber/30 pl-2 leading-relaxed italic">
                            "{stance}"
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Consensus Line */}
                <div
                  className={`flex items-start gap-2.5 p-3 rounded border border-amber-500/20 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.05)] transition-all duration-500 transform ${
                    animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="w-4.5 h-4.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 mt-0.5 animate-pulse">
                    <Brain className="w-2.5 h-2.5" />
                  </div>
                  <p className="text-[10px] font-mono text-amber-400 font-semibold leading-relaxed uppercase tracking-wide">
                    {consensusStance}
                  </p>
                </div>

                {/* Loading / Thinking indicator */}
                {animationStep < 3 && (
                  <div className="flex items-center gap-2 text-[8px] font-mono text-gray-500 justify-center uppercase animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-cyber-blue animate-ping" />
                    <span>
                      {animationStep === 0
                        ? "Cost Agent analyzing price metrics..."
                        : animationStep === 1
                        ? "Security Agent analyzing transit corridor risks..."
                        : "Synthesizing stakeholder consensus..."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        
        {options.map((opt, idx) => {
          const isSelected = selectedRoute === idx;
          const isVisible = idx < visibleLimit;
          const scoreColor = getScoreColor(opt.overallScore);

          return (
            <div
              key={idx}
              onClick={() => setSelectedRoute(idx)}
              style={{ transitionDelay: `${idx * 50}ms` }}
              className={`p-5 rounded border cursor-pointer transition-all duration-300 transform text-left flex flex-col gap-3.5 ${
                !isVisible ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
              } ${
                idx === 0
                  ? "border-amber-500/50 bg-amber-500/[0.03] shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/10"
                  : isSelected
                  ? "bg-cyber-blue/5 border-cyber-blue shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-[#0b0f19]/40 border-cyber-border/60 hover:bg-[#0b0f19]/80 hover:border-gray-700"
              }`}
            >
              {/* Row Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {idx === 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[8px] uppercase tracking-widest font-mono font-extrabold w-fit mb-1.5 animate-pulse">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Recommended Logistics Action
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      idx === 0 ? "bg-amber-500/20 text-amber-400" : "bg-gray-800 text-gray-400"
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                        {opt.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-sans flex items-center gap-1 mt-0.5">
                        <Anchor className="w-3 h-3 text-gray-500" /> Source: {opt.source}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`px-2.5 py-1.5 rounded border text-sm font-mono font-black flex flex-col items-center justify-center min-w-[55px] ${scoreColor}`}>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-normal">Score</span>
                  <AnimatedNumber value={opt.overallScore} duration={500} formatter={(n) => `${Math.round(n)}`} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cyber-bg/40 p-3 rounded border border-cyber-border/40 text-[10px] font-mono">
                {/* Price Premium */}
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-cyber-blue" />
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px]">Premium</span>
                    <span className={`font-semibold ${opt.pricePremium <= 0 || opt.name.toLowerCase().includes("spr") || opt.name.toLowerCase().includes("strategic") ? "text-cyber-green" : "text-white"}`}>
                      {opt.name.toLowerCase().includes("spr") || opt.name.toLowerCase().includes("strategic") || opt.pricePremium === 0
                        ? "₹0/bbl (domestic — no import premium)"
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
                    <span className="text-white font-semibold">
                      <AnimatedNumber value={opt.transitDays} duration={500} formatter={(n) => `${Math.round(n)}`} /> Days
                    </span>
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
                    <span className="text-white font-semibold">
                      <AnimatedNumber value={opt.compatibility} duration={500} formatter={(n) => `${Math.round(n)}%`} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Chain of Thought Reasoning Panel */}
              {(isSelected || idx === 0) && (
                <div className="border-t border-cyber-border/50 pt-3 mt-1 flex flex-col gap-1.5">
                  <span className="text-[8px] tracking-wider text-cyber-blue font-mono font-bold uppercase flex items-center gap-1">
                    <Brain className="w-3 h-3 text-cyber-blue animate-pulse" />
                    Agentic Reasoning & Strategic Justification
                  </span>
                  <div className="bg-[#050814] p-3.5 border border-cyber-border/60 rounded text-[10px] font-mono text-gray-300 leading-relaxed italic">
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
