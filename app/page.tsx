"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shield, Sliders, Brain, FileText, Play, Cpu } from "lucide-react";
import RiskIntelligence from "@/components/RiskIntelligence";
import ScenarioModeller from "@/components/ScenarioModeller";
import ProcurementOrchestrator from "@/components/ProcurementOrchestrator";
import ExecutiveMemo from "@/components/ExecutiveMemo";
import AnimatedNumber from "@/components/AnimatedNumber";


// Interfaces
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

interface ScenarioImpact {
  refinery_run_rate_drop: number;
  fuel_price_delta: number;
  days_of_cover: number;
  gdp_drag: number;
  assumptions: string[];
}

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

interface MemoStructure {
  memoId: string;
  date: string;
  to: string;
  from: string;
  subject: string;
  executiveSummary: string;
  riskAssessment: string[];
  impactFindings: string[];
  procurementDirectives: string[];
  sprDirectives: string;
  signature: string;
  timeSavedStatement: string;
  autoTriggerStatement?: string;
}

export default function Dashboard() {
  // Global States
  const [corridors, setCorridors] = useState<{ [key: string]: CorridorState }>({});
  const [signals, setSignals] = useState<GeopoliticalSignal[]>([]);
  const [brentPrice, setBrentPrice] = useState<number>(74.50);
  const [brentSource, setBrentSource] = useState<string>("Estimated");
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("baseline");
  const [customCapacityLoss, setCustomCapacityLoss] = useState<number>(0);
  const [impact, setImpact] = useState<ScenarioImpact>({
    refinery_run_rate_drop: 0,
    fuel_price_delta: 0,
    days_of_cover: 9.5,
    gdp_drag: 0,
    assumptions: [
      "Assumes normal corridor supply lanes are operational.",
      "Assumes baseline Brent crude price levels."
    ],
  });

  const [animatedDaysOfCover, setAnimatedDaysOfCover] = useState<number>(9.5);
  const [animatedRefinery, setAnimatedRefinery] = useState<number>(0);
  const [animatedPrice, setAnimatedPrice] = useState<number>(0);
  const [animatedGdp, setAnimatedGdp] = useState<number>(0);

  const animatedDaysRef = useRef(animatedDaysOfCover);
  const animatedRefineryRef = useRef(animatedRefinery);
  const animatedPriceRef = useRef(animatedPrice);
  const animatedGdpRef = useRef(animatedGdp);

  useEffect(() => {
    animatedDaysRef.current = animatedDaysOfCover;
    animatedRefineryRef.current = animatedRefinery;
    animatedPriceRef.current = animatedPrice;
    animatedGdpRef.current = animatedGdp;
  }, [animatedDaysOfCover, animatedRefinery, animatedPrice, animatedGdp]);

  useEffect(() => {
    const targetDays = impact?.days_of_cover ?? 9.5;
    const targetRefinery = impact?.refinery_run_rate_drop ?? 0;
    const targetPrice = impact?.fuel_price_delta ?? 0;
    const targetGdp = impact?.gdp_drag ?? 0;

    const startDays = animatedDaysRef.current;
    const startRefinery = animatedRefineryRef.current;
    const startPrice = animatedPriceRef.current;
    const startGdp = animatedGdpRef.current;

    const duration = 10000; // 10 seconds synchronized tweening
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeInOutQuad
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      setAnimatedDaysOfCover(startDays + (targetDays - startDays) * ease);
      setAnimatedRefinery(startRefinery + (targetRefinery - startRefinery) * ease);
      setAnimatedPrice(startPrice + (targetPrice - startPrice) * ease);
      setAnimatedGdp(startGdp + (targetGdp - startGdp) * ease);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [impact?.days_of_cover, impact?.refinery_run_rate_drop, impact?.fuel_price_delta, impact?.gdp_drag]);

  const [procurementOptions, setProcurementOptions] = useState<ProcurementOption[]>([]);
  const [memo, setMemo] = useState<MemoStructure>({
    memoId: "S47-MOPNG-PENDING",
    date: new Date().toLocaleDateString("en-IN"),
    to: "Minister of Petroleum & Natural Gas, Government of India",
    from: "Sentinel-47 Energy Security Intelligence System",
    subject: "EMERGENCY OIL SUPPLY RESILIENCE & PROCUREMENT ACTION PLAN",
    executiveSummary: "Initializing system states. Select a disruption scenario to generate briefing details.",
    riskAssessment: ["Awaiting telemetry analysis."],
    impactFindings: ["No active disruption scenario modeled."],
    procurementDirectives: ["No emergency routes required."],
    sprDirectives: "Strategic reserves at full capacity. No drawdown required.",
    signature: "Director-General, Sentinel-47",
    timeSavedStatement: "Awaiting calculation cycle."
  });

  // Loader states
  const [isLoadingRisk, setIsLoadingRisk] = useState<boolean>(false);
  const [isLoadingScenario, setIsLoadingScenario] = useState<boolean>(false);
  const [isLoadingProcurement, setIsLoadingProcurement] = useState<boolean>(false);
  const [isLoadingMemo, setIsLoadingMemo] = useState<boolean>(false);

  // Guided Demo States
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoPaused, setDemoPaused] = useState<boolean>(false);
  const [demoTime, setDemoTime] = useState<number>(0);
  const [procurementVisibleCount, setProcurementVisibleCount] = useState<number | undefined>(undefined);
  const [showResiliencePopover, setShowResiliencePopover] = useState<boolean>(false);


  // Core pipelines
  // Fetch Geopolitical Risk intelligence
  const fetchRiskIntelligence = async () => {
    setIsLoadingRisk(true);
    try {
      const res = await fetch("/api/risk");
      if (res.ok) {
        const data = await res.json();
        setCorridors(data.corridors);
        setSignals(data.signals);
        setBrentPrice(data.brentPrice);
        setBrentSource(data.brentSource);
        return data;
      }
    } catch (e) {
      console.error("Failed to load risk intelligence:", e);
    } finally {
      setIsLoadingRisk(false);
    }
  };

  // Run Scenario Modeller
  const runScenarioSimulation = async (scId: string, customLoss: number, currentPrice: number) => {
    setIsLoadingScenario(true);
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scId,
          customCapacityLoss: customLoss,
          brentPrice: currentPrice,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setImpact(data.impact);
        return data.impact;
      }
    } catch (e) {
      console.error("Failed to simulate scenario:", e);
    } finally {
      setIsLoadingScenario(false);
    }
  };

  // Run Procurement Orchestration
  const runProcurementOrchestration = async (scId: string, loss: number, currentPrice: number) => {
    setIsLoadingProcurement(true);
    try {
      const res = await fetch("/api/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scId,
          capacityLoss: loss,
          brentPrice: currentPrice,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProcurementOptions(data.options);
        return data.options;
      }
    } catch (e) {
      console.error("Failed to rank procurement options:", e);
    } finally {
      setIsLoadingProcurement(false);
    }
  };

  // Compile Executive Briefing Memo
  const compileDecisionMemo = async (
    corrs: any,
    brPrice: number,
    brSrc: string,
    scName: string,
    loss: number,
    imp: ScenarioImpact,
    procOpts: ProcurementOption[],
    compTime: number
  ) => {
    setIsLoadingMemo(true);
    try {
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corridors: corrs,
          brentPrice: brPrice,
          brentSource: brSrc,
          scenarioName: scName,
          capacityLoss: loss,
          impact: imp,
          procurementOptions: procOpts,
          computationTimeMs: compTime,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMemo(data.memo);
      }
    } catch (e) {
      console.error("Failed to compile decision brief:", e);
    } finally {
      setIsLoadingMemo(false);
    }
  };

  // Pipeline Orchestrator (Trigger when scenario changes)
  const triggerFullPipeline = async (scId: string, customLoss: number) => {
    const startTime = Date.now();

    // 1. Ensure risk data exists
    let activeCorridors = corridors;
    let activeBrent = brentPrice;
    let activeSource = brentSource;
    if (Object.keys(corridors).length === 0) {
      const riskData = await fetchRiskIntelligence();
      if (riskData) {
        activeCorridors = riskData.corridors;
        activeBrent = riskData.brentPrice;
        activeSource = riskData.brentSource;
      }
    }

    // Determine loss based on selected scenario
    let computedLoss = customLoss;
    let scenarioName = "Custom Simulation";
    if (scId === "hormuz_50") {
      computedLoss = 50;
      scenarioName = "Strait of Hormuz 50% Closure";
    } else if (scId === "opec_cut") {
      computedLoss = 20;
      scenarioName = "OPEC+ Emergency Supply Cut";
    } else if (scId === "red_sea_full") {
      computedLoss = 80;
      scenarioName = "Red Sea Full Transit Suspension";
    } else if (scId === "replay_2025") {
      computedLoss = 40;
      scenarioName = "2025 US-Iran Standoff Backtest";
    }

    // 2. Modeler Agent
    const activeImpact = await runScenarioSimulation(scId, computedLoss, activeBrent);
    
    // 3. Procurement Orchestrator Agent
    const activeProc = await runProcurementOrchestration(scId, computedLoss, activeBrent);

    // Calculate elapsed time (simulating AI agent computation)
    const compilationTime = Date.now() - startTime + 80; // Add standard network offset

    // 4. Memo Synthesis Agent
    if (activeImpact && activeProc) {
      await compileDecisionMemo(
        activeCorridors,
        activeBrent,
        activeSource,
        scenarioName,
        computedLoss,
        activeImpact,
        activeProc,
        compilationTime
      );
    }
  };

  const demoActiveRef = useRef(demoActive);

  useEffect(() => {
    demoActiveRef.current = demoActive;
  }, [demoActive]);

  // Initial Load
  useEffect(() => {
    fetchRiskIntelligence().then((riskData) => {
      if (demoActiveRef.current) return;
      if (riskData) {
        runScenarioSimulation("baseline", 0, riskData.brentPrice).then((imp) => {
          if (demoActiveRef.current) return;
          runProcurementOrchestration("baseline", 0, riskData.brentPrice).then((proc) => {
            if (demoActiveRef.current) return;
            if (imp && proc) {
              compileDecisionMemo(
                riskData.corridors,
                riskData.brentPrice,
                riskData.brentSource,
                "Baseline Operations",
                0,
                imp,
                proc,
                110
              );
            }
          });
        });
      }
    });
  }, []);

  // Central timer-based Demo Controller loop
  useEffect(() => {
    if (!demoActive || demoPaused) return;

    const interval = setInterval(() => {
      setDemoTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [demoActive, demoPaused]);

  // Handle Demo Auto-Stop
  useEffect(() => {
    if (demoActive && demoTime >= 90) {
      stopDemo();
    }
  }, [demoTime, demoActive]);

  // Unified Demo Narration and View State Resolver
  const getDemoNarration = (time: number) => {
    if (time >= 0 && time < 5) {
      return {
        step: 1,
        view: 0,
        label: "GEOPOLITICAL THREAT SCANNING",
        text: "[GEOPOLITICAL AGENT] Loading corridor map & real-time telemetry streams...",
      };
    }
    if (time >= 5 && time < 20) {
      return {
        step: 1,
        view: 0,
        label: "CORRIDOR EXCELLENCE WARNING",
        text: "[GEOPOLITICAL AGENT] Alert! News threat telemetry crossed WARNING threshold (50%) in Red Sea.",
      };
    }
    if (time >= 20 && time < 25) {
      return {
        step: 2,
        view: 1,
        label: "DISRUPTION SIMULATION SCENARIO",
        text: "[SCENARIO AGENT] Transitioning to Scenario Modeller. Triggering Red Sea Suspension preset...",
      };
    }
    if (time >= 25 && time < 45) {
      return {
        step: 2,
        view: 1,
        label: "CASCADING SHOCK ANALYSIS",
        text: "[SCENARIO AGENT] Calculating cascading fuel prices, Strategic Reserve drawdown cover, and GDP growth drag...",
      };
    }
    if (time >= 45 && time < 50) {
      return {
        step: 3,
        view: 2,
        label: "ADAPTIVE ROUTE RE-ALLOCATION",
        text: "[PROCUREMENT AGENT] Transitioning to Sourcing. Ranking alternate maritime sourcing routes...",
      };
    }
    if (time >= 50 && time < 65) {
      return {
        step: 3,
        view: 2,
        label: "MULTI-CRITERIA CRUDE RANKINGS",
        text: "[PROCUREMENT AGENT] Alternative routes ranked by refinery compatibility, transit speed, and port congestion levels.",
      };
    }
    if (time >= 65 && time < 72) {
      return {
        step: 4,
        view: 3,
        label: "POLICY BRIEF COMPILATION",
        text: "[DECISION AGENT] Transitioning to Executive Brief. Autonomously compiling policy brief briefing memo...",
      };
    }
    return {
      step: 4,
      view: 3,
      label: "EXECUTIVE BRIEF SYNTHESIS COMPLETE",
      text: "[DECISION AGENT] Executive brief compiled. Policy response formulated and ready for ministerial signature.",
    };
  };

  const currentNarration = getDemoNarration(demoTime);

  // Synced View Snapping Effect
  useEffect(() => {
    if (demoActive && !demoPaused) {
      setActiveTab(currentNarration.view);
    }
  }, [demoTime, demoActive, demoPaused, currentNarration.view]);

  // Demo debug console log verification logger
  useEffect(() => {
    if (demoActive) {
      console.log(
        `[Sentinel Demo Debug] Time: ${demoTime}s | Step Index: ${currentNarration.step} | Step Label: ${currentNarration.label} | Target View: ${currentNarration.view} | Paused: ${demoPaused}`
      );
    }
  }, [demoTime, demoActive, demoPaused, currentNarration]);

  // Demo side-effects executor (runs state mutations exactly as demoTime advances)
  useEffect(() => {
    if (!demoActive || demoPaused) return;

    if (demoTime === 0) {
      // Reset states
      setCorridors(prev => {
        const reset = { ...prev };
        if (reset["Red Sea"]) {
          reset["Red Sea"] = { ...reset["Red Sea"], score: 15, status: "STABLE" };
        }
        return reset;
      });
      setSignals(prev => prev.filter(s => s.id !== "demo-red-sea-warning"));
    } 
    else if (demoTime === 5) {
      const demoSignal: GeopoliticalSignal = {
        id: "demo-red-sea-warning",
        corridor: "Red Sea",
        event_type: "Corridor Security Escalation",
        severity_0to10: 7.2,
        confidence: 0.94,
        source: "Sentinel Agent Intelligence",
        timestamp: new Date().toISOString(),
        reasoning: "Corridor threat probability crossed Warning threshold (50%) due to sudden ship rerouting directives.",
        headline: "ALERT: Red Sea cargo lines diverted following escalation in shipping corridor"
      };

      setCorridors(prev => ({
        ...prev,
        "Red Sea": {
          name: "Red Sea",
          score: 50,
          status: "WARNING",
          description: "Auto-escalation warning triggered by transit reroutes."
        }
      }));
      setSignals(prev => [demoSignal, ...prev]);

      setTimeout(() => {
        const feed = document.getElementById("threat-signal-feed");
        if (feed) {
          feed.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } 
    else if (demoTime === 20) {
      setActiveScenarioId("red_sea_full");
      setCustomCapacityLoss(80);
      triggerFullPipeline("red_sea_full", 80);
    }
    else if (demoTime === 45) {
      setProcurementVisibleCount(0);
      let count = 0;
      const staggerInterval = setInterval(() => {
        count++;
        setProcurementVisibleCount(count);
        if (count >= 5) {
          clearInterval(staggerInterval);
        }
      }, 150);
    }
    else if (demoTime === 65) {
      setIsLoadingMemo(true);
      setTimeout(() => {
        setIsLoadingMemo(false);
      }, 1250);
    }
  }, [demoTime, demoActive, demoPaused]);

  // Demo Control methods
  const startDemo = () => {
    setDemoActive(true);
    setDemoPaused(false);
    setDemoTime(0);
  };

  const stopDemo = () => {
    setDemoActive(false);
    setDemoPaused(false);
    setDemoTime(0);
    setProcurementVisibleCount(undefined);
  };

  const togglePause = () => {
    setDemoPaused(prev => !prev);
  };

  const skipDemo = () => {
    setDemoTime(65);
  };

  const navItems = [
    { icon: Shield, label: "1. Geopolitical Risk" },
    { icon: Sliders, label: "2. Disruption Scenario" },
    { icon: Brain, label: "3. Sourcing Logistics" },
    { icon: FileText, label: "4. Executive Brief" },
  ];

  const hormuzRisk = corridors["Hormuz"]?.score ?? 15;
  const redSeaRisk = corridors["Red Sea"]?.score ?? 15;
  const suezRisk = corridors["Suez"]?.score ?? 15;
  const avgCorridorRisk = (hormuzRisk + redSeaRisk + suezRisk) / 3;
  const corridorResilience = 100 - avgCorridorRisk;

  const sprDays = animatedDaysOfCover;
  const sprResilience = (sprDays / 9.5) * 100;

  const runRateDrop = impact?.refinery_run_rate_drop ?? 0;
  const refineryResilience = 100 - runRateDrop;

  const gdpDragVal = impact?.gdp_drag ?? 0;
  const gdpResilience = Math.max(0, 100 - (gdpDragVal / 1.5) * 100);

  // Methodology generalizes to any import-dependent economy or critical commodity by substituting corridor/reserve/GDP inputs — scoring structure is commodity-agnostic.
  const compositeResilienceScore = Math.round(
    (corridorResilience * 0.30) +
    (sprResilience * 0.30) +
    (refineryResilience * 0.25) +
    (gdpResilience * 0.15)
  );

  const getResilienceColor = (score: number) => {
    if (score >= 70) return {
      text: "text-cyber-green",
      border: "border-cyber-green/40",
      bg: "bg-cyber-green/10",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    };
    if (score >= 40) return {
      text: "text-cyber-amber",
      border: "border-cyber-amber/40",
      bg: "bg-cyber-amber/10",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    };
    return {
      text: "text-cyber-red",
      border: "border-cyber-red/40",
      bg: "bg-cyber-red/10",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.25)]",
    };
  };

  const resilienceStyles = getResilienceColor(compositeResilienceScore);

  return (
    <div className="flex flex-col min-h-screen text-gray-100 bg-[#030712] font-sans">
      
      {/* 1. Persistent Top Strip (Ambient Awareness Telemetry Layer) */}
      <header className="bg-[#0b0f19] border-b border-cyber-border px-6 py-3 flex flex-row items-center justify-between gap-4 print:hidden select-none h-16 shrink-0 z-30">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-cyber-blue/30 bg-cyber-blue/10 flex items-center justify-center text-cyber-blue shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Shield className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black tracking-widest font-mono text-white">
              SENTINEL-47 // COMMAND CONTROL
            </h1>
            <p className="text-[9px] text-gray-400 font-mono tracking-wide">
              INTEGRATED CRUDE OIL RISK RESPONSE // SECURITY LEVEL 1
            </p>
          </div>
        </div>

        {/* Center: Ambient Awareness Telemetry */}
        <div className="hidden md:flex items-center gap-5 text-[10px] font-mono text-gray-400">
          
          {/* Brent crude baseline price */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">BRENT:</span>
            <span className="text-white font-bold">${brentPrice.toFixed(2)}</span>
          </div>

          {/* Corridor Risk telemetry and dots */}
          {(["Hormuz", "Red Sea", "Suez"] as const).map((corridorName) => {
            const data = corridors[corridorName] || { score: 15, status: "STABLE" };
            const isCritical = data.status === "CRITICAL";
            const isWarning = data.status === "WARNING";
            const dotColor = isCritical ? "bg-cyber-red animate-pulse" : isWarning ? "bg-cyber-orange animate-pulse" : "bg-cyber-green";
            const textColor = isCritical ? "text-cyber-red" : isWarning ? "text-cyber-orange" : "text-cyber-green";
            
            return (
              <div key={corridorName} className="flex items-center gap-1.5 border-l border-cyber-border/80 pl-3">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span className="text-gray-500 uppercase">{corridorName}:</span>
                <span className={`${textColor} font-bold`}>{data.score}%</span>
              </div>
            );
          })}

          {/* Overall DEFCON system status */}
          <div className="flex items-center gap-1.5 border-l border-cyber-border/80 pl-3">
            <span className="text-gray-500">SYSTEM STATE:</span>
            <span className="text-cyber-blue font-bold uppercase tracking-wide">
              {demoActive ? "DEMO_TEST_RUN" : corridors["Red Sea"]?.status === "WARNING" || corridors.Hormuz?.status === "CRITICAL" ? "WARN_EVAL" : "ACTIVE_STANDBY"}
            </span>
          </div>

          {/* Sentinel Resilience Index Composite Score */}
          <div className="relative flex items-center gap-2 border-l border-cyber-border/80 pl-3">
            <div
              onClick={() => setShowResiliencePopover(!showResiliencePopover)}
              className={`flex items-center gap-2 px-2.5 py-0.5 rounded border cursor-pointer transition-all duration-300 ${resilienceStyles.border} ${resilienceStyles.bg} ${resilienceStyles.glow} hover:scale-[1.02]`}
            >
              <div className="flex flex-col text-left">
                <span className="text-[7.5px] text-gray-500 font-mono font-bold leading-none">INDIA RESILIENCE</span>
                <span className="text-[7.5px] text-gray-300 font-mono mt-0.5 leading-none">SCORE:</span>
              </div>
              <div className={`text-xs font-black font-mono leading-none ${resilienceStyles.text}`}>
                <AnimatedNumber value={compositeResilienceScore} duration={500} formatter={(n) => `${Math.round(n)}`} />
              </div>
            </div>
            
            <span className="hidden lg:block text-[7.5px] text-gray-500 font-mono uppercase tracking-wide max-w-[85px] border-l border-cyber-border/40 pl-2 leading-tight text-left">
              COMPOSITE — DERIVED FROM LIVE + MODELED MODULE DATA
            </span>

            {/* Breakdown Popover */}
            {showResiliencePopover && (
              <div className="absolute top-full right-0 mt-2.5 w-[280px] bg-[#070b13]/95 border border-cyber-border/90 rounded p-4 shadow-2xl z-50 text-left font-mono backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-cyber-border/80 pb-2 mb-3">
                  <span className="text-[9px] uppercase font-bold text-white tracking-wider">
                    Resilience Index Breakdown
                  </span>
                  <button
                    onClick={() => setShowResiliencePopover(false)}
                    className="text-[9px] text-gray-500 hover:text-white uppercase font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Corridor Risk */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        1. Corridor Risk
                        <span className="px-1 py-0.2 rounded bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-[7px] font-bold">LIVE</span>
                      </span>
                      <span className="text-white font-bold">{Math.round(corridorResilience)}/100 (w: 30%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded overflow-hidden">
                      <div className="h-full bg-cyber-blue transition-all duration-500" style={{ width: `${corridorResilience}%` }} />
                    </div>
                    <span className="text-[8px] text-gray-500">Avg Corridor Risk: {Math.round(avgCorridorRisk)}%</span>
                  </div>

                  {/* SPR Depletion */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        2. SPR Depletion
                        <span className="px-1 py-0.2 rounded bg-cyber-indigo/10 border border-cyber-indigo/20 text-cyber-indigo text-[7px] font-bold">MODELED</span>
                      </span>
                      <span className="text-white font-bold">{Math.round(sprResilience)}/100 (w: 30%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded overflow-hidden">
                      <div className="h-full bg-cyber-indigo transition-all duration-500" style={{ width: `${sprResilience}%` }} />
                    </div>
                    <span className="text-[8px] text-gray-500">SPR Cover: {sprDays.toFixed(1)} / 9.5 Days</span>
                  </div>

                  {/* Refinery Exposure */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        3. Refinery Exposure
                        <span className="px-1 py-0.2 rounded bg-cyber-indigo/10 border border-cyber-indigo/20 text-cyber-indigo text-[7px] font-bold">MODELED</span>
                      </span>
                      <span className="text-white font-bold">{Math.round(refineryResilience)}/100 (w: 25%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded overflow-hidden">
                      <div className="h-full bg-cyber-orange transition-all duration-500" style={{ width: `${refineryResilience}%` }} />
                    </div>
                    <span className="text-[8px] text-gray-500">Refinery Run Rate: {Math.round(refineryResilience)}% (drop: -{runRateDrop.toFixed(1)}%)</span>
                  </div>

                  {/* GDP Drag */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        4. GDP Drag
                        <span className="px-1 py-0.2 rounded bg-cyber-indigo/10 border border-cyber-indigo/20 text-cyber-indigo text-[7px] font-bold">MODELED</span>
                      </span>
                      <span className="text-white font-bold">{Math.round(gdpResilience)}/100 (w: 15%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded overflow-hidden">
                      <div className="h-full bg-cyber-red transition-all duration-500" style={{ width: `${gdpResilience}%` }} />
                    </div>
                    <span className="text-[8px] text-gray-500">GDP Drag: -{gdpDragVal.toFixed(2)}% (max normalized: 1.5%)</span>
                  </div>
                </div>

                <div className="mt-3.5 border-t border-cyber-border/70 pt-2.5 flex flex-col text-[8px] text-gray-500 leading-normal gap-1.5">
                  <span className="text-cyber-blue font-bold tracking-wide uppercase">
                    COMPOSITE — DERIVED FROM LIVE + MODELED MODULE DATA
                  </span>
                  <span>
                    Composite resilience score aggregates live pipeline news telemetry and stress testing scenarios under the active model constraints.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex flex-col text-right font-mono text-[8px] text-gray-500 leading-normal border-r border-cyber-border/50 pr-4">
            <div>SYSTEM ENCRYPTION: SECURE</div>
            <div>Refinery Sync: 4 facilities</div>
          </div>

          <button
            onClick={demoActive ? stopDemo : startDemo}
            className={`flex items-center gap-1.5 px-4 py-2 rounded font-mono text-[10px] font-black tracking-wider border transition-all ${
              demoActive
                ? "bg-cyber-red/10 border-cyber-red/30 text-cyber-red hover:bg-cyber-red hover:text-white"
                : "bg-gradient-to-r from-cyber-orange to-cyber-indigo text-white border-cyber-orange hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:scale-[1.01]"
            }`}
          >
            <Play className={`w-3 h-3 ${demoActive && !demoPaused ? "animate-spin" : ""}`} />
            {demoActive ? "STOP TOUR" : "RUN GUIDED DEMO"}
          </button>
        </div>
      </header>

      {/* 2. Demo Narration Overlay HUD (Matches Command Center Aesthetic) */}
      {demoActive && (
        <div className="bg-[#0b0f19] border-b border-cyber-orange px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs font-bold text-white z-40 print:hidden select-none animate-pulse">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Cpu className={`w-4 h-4 text-cyber-orange ${demoPaused ? "" : "animate-spin-slow"}`} />
            <span className="text-cyber-orange uppercase">
              Guided Narrated Tour ({demoTime}s / 90s){demoPaused ? " [PAUSED]" : ""}:
            </span>
            <span className="text-cyber-blue font-bold px-1.5 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/20">
              {currentNarration.label}
            </span>
            <span className="text-gray-300 font-medium italic ml-1">
              {demoPaused ? `[PAUSED ON STEP ${currentNarration.step}] ${currentNarration.text}` : currentNarration.text}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="flex items-center gap-1 px-3 py-1 bg-cyber-orange/15 border border-cyber-orange/30 text-cyber-orange hover:bg-cyber-orange hover:text-black rounded text-[10px] font-black"
            >
              {demoPaused ? "RESUME" : "PAUSE"}
            </button>
            <button
              onClick={skipDemo}
              className="px-3 py-1 bg-cyber-indigo/25 border border-cyber-indigo/40 text-cyber-indigo hover:bg-cyber-indigo hover:text-white rounded text-[10px] font-black"
            >
              SKIP TO MEMO
            </button>
            <button
              onClick={stopDemo}
              className="px-3 py-1 bg-cyber-red/15 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red hover:text-white rounded text-[10px] font-black"
            >
              EXIT TOUR
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="flex-1 flex flex-row min-h-0 relative overflow-hidden">
        
        {/* Left Side: Vertical Navigation Icon Rail */}
        <div className="w-16 min-h-screen bg-[#070b13] border-r border-cyber-border flex flex-col items-center py-6 gap-6 shrink-0 print:hidden select-none z-20">
          {navItems.map((item, idx) => {
            const isActive = activeTab === idx;
            return (
              <div key={idx} className="relative group">
                <button
                  onClick={() => {
                    if (demoActive) {
                      // Pause demo if user manually navigates to inspect
                      setDemoPaused(true);
                    }
                    setActiveTab(idx);
                  }}
                  className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-cyber-blue/10 border border-cyber-blue text-cyber-blue shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      : "bg-transparent border border-transparent text-gray-500 hover:text-white hover:bg-gray-800/40"
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5" />
                </button>
                {/* Active side light bar */}
                {isActive && (
                  <div className="absolute left-[-12px] top-2 w-1.5 h-6 bg-cyber-blue rounded-r shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
                {/* Tooltip on hover */}
                <div className="absolute left-14 top-2 hidden group-hover:block bg-[#0b0f19] border border-cyber-border text-white text-[10px] font-mono py-1.5 px-3 rounded whitespace-nowrap z-50 shadow-md">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Main view display container with slide-and-crossfade transitions */}
        <div className="flex-1 relative min-h-0 bg-cyber-bg z-10">
          
          {/* View 1: Geopolitical Risk Intelligence */}
          <div className={`absolute inset-0 p-6 overflow-y-auto transition-all duration-300 transform ${
            activeTab === 0 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto" 
              : "opacity-0 -translate-x-8 pointer-events-none scale-95"
          }`}>
            <RiskIntelligence
              corridors={corridors}
              signals={signals}
              brentPrice={brentPrice}
              brentSource={brentSource}
              isLoading={isLoadingRisk}
              onRefresh={fetchRiskIntelligence}
            />
          </div>

          {/* View 2: Disruption Scenario Modeller */}
          <div className={`absolute inset-0 p-6 overflow-y-auto transition-all duration-300 transform ${
            activeTab === 1 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto" 
              : "opacity-0 translate-x-8 pointer-events-none scale-95"
          }`}>
            <ScenarioModeller
              activeScenarioId={activeScenarioId}
              customCapacityLoss={customCapacityLoss}
              impact={impact}
              animatedDaysOfCover={animatedDaysOfCover}
              animatedRefinery={animatedRefinery}
              animatedPrice={animatedPrice}
              animatedGdp={animatedGdp}
              isLoading={isLoadingScenario}
              onScenarioChange={(scId) => {
                setActiveScenarioId(scId);
                triggerFullPipeline(scId, customCapacityLoss);
              }}
              onCustomLossChange={(loss) => {
                setCustomCapacityLoss(loss);
                triggerFullPipeline("custom", loss);
              }}
            />
          </div>

          {/* View 3: Adaptive Procurement Orchestrator */}
          <div className={`absolute inset-0 p-6 overflow-y-auto transition-all duration-300 transform ${
            activeTab === 2 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto" 
              : "opacity-0 translate-x-8 pointer-events-none scale-95"
          }`}>
            <ProcurementOrchestrator
              options={procurementOptions}
              isLoading={isLoadingProcurement}
              visibleCount={procurementVisibleCount}
            />
          </div>

          {/* View 4: Executive Memo Agent */}
          <div className={`absolute inset-0 p-6 overflow-y-auto transition-all duration-300 transform print:relative print:inset-auto print:p-0 print:transform-none ${
            activeTab === 3 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto" 
              : "opacity-0 translate-x-8 pointer-events-none scale-95 print:block"
          }`}>
            <ExecutiveMemo
              memo={memo}
              isLoading={isLoadingMemo}
              gdpDrag={impact.gdp_drag}
              sprDays={animatedDaysOfCover}
              onGenerate={() =>
                triggerFullPipeline(activeScenarioId, customCapacityLoss)
              }
            />
          </div>

        </div>

      </div>

    </div>
  );
}
