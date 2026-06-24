"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Brain, Play, Shield, ShieldAlert, Cpu } from "lucide-react";
import RiskIntelligence from "@/components/RiskIntelligence";
import ScenarioModeller from "@/components/ScenarioModeller";
import ProcurementOrchestrator from "@/components/ProcurementOrchestrator";
import ExecutiveMemo from "@/components/ExecutiveMemo";

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
}

export default function Dashboard() {
  // Global States
  const [corridors, setCorridors] = useState<{ [key: string]: CorridorState }>({});
  const [signals, setSignals] = useState<GeopoliticalSignal[]>([]);
  const [brentPrice, setBrentPrice] = useState<number>(74.50);
  const [brentSource, setBrentSource] = useState<string>("Estimated");
  
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

  // Demo Tour State
  const [demoState, setDemoState] = useState<{
    isActive: boolean;
    step: number;
    text: string;
  }>({
    isActive: false,
    step: 0,
    text: "",
  });

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

  // Initial Load
  useEffect(() => {
    fetchRiskIntelligence().then((riskData) => {
      // Initialize with default baseline states
      if (riskData) {
        runScenarioSimulation("baseline", 0, riskData.brentPrice).then((imp) => {
          runProcurementOrchestration("baseline", 0, riskData.brentPrice).then((proc) => {
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

  // Guided Demo Mode Walkthrough Trigger
  const startGuidedDemo = () => {
    if (demoState.isActive) return;

    setDemoState({
      isActive: true,
      step: 1,
      text: "[GEOPOLITICAL AGENT] Querying live News headlines & Brent pricing streams...",
    });

    // Step 1: Trigger risk polling (Simulate live polling feedback)
    setTimeout(() => {
      setDemoState({
        isActive: true,
        step: 2,
        text: "[GEOPOLITICAL AGENT] News parsed. Strait of Hormuz threat score adjusted to 78% (CRITICAL).",
      });

      // Step 2: Trigger Hormuz preset
      setActiveScenarioId("hormuz_50");
      setCustomCapacityLoss(50);

      setTimeout(() => {
        setDemoState({
          isActive: true,
          step: 3,
          text: "[SCENARIO AGENT] Running cascading oil disruptions. Estimated refinery processing drops by 21%.",
        });

        // Trigger simulation pipeline
        triggerFullPipeline("hormuz_50", 50);

        setTimeout(() => {
          setDemoState({
            isActive: true,
            step: 4,
            text: "[PROCUREMENT AGENT] Re-routing supply lines. Pinpointing US WTI Midland & local Padur SPR releases.",
          });

          setTimeout(() => {
            setDemoState({
              isActive: true,
              step: 5,
              text: "[DECISION AGENT] Synthesizing emergency ministerial memorandum. Generating official brief...",
            });

            setTimeout(() => {
              setDemoState({
                isActive: false,
                step: 0,
                text: "",
              });
            }, 5000); // Wait on Memo reveal
          }, 4000);
        }, 4000);
      }, 4000);
    }, 4000);
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-100 font-sans pb-10">
      {/* Top Banner (National Security HUD Style) */}
      <header className="bg-[#0b0f19] border-b border-cyber-border/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded border border-cyber-red/30 bg-cyber-red/10 flex items-center justify-center text-cyber-red shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider font-mono text-white flex items-center gap-2">
              SENTINEL-47 // RESILIENCE PLATFORM
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-wide">
              INTEGRATED NATIONAL ENERGY SUPPLY RESPONSE SYSTEMS // LEVEL 1 SECURE
            </p>
          </div>
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right font-mono text-[9px] text-gray-500 border-r border-cyber-border/60 pr-4">
            <div>SYSTEM ENCRYPTION: SECURE // TLS 1.3</div>
            <div>Refinery Sync: 4 active facilities</div>
          </div>

          <button
            onClick={startGuidedDemo}
            disabled={demoState.isActive}
            className={`flex items-center gap-2 px-5 py-2.5 rounded font-mono text-xs font-black tracking-widest border transition-all ${
              demoState.isActive
                ? "bg-cyber-orange/10 border-cyber-orange/30 text-cyber-orange cursor-not-allowed"
                : "bg-gradient-to-r from-cyber-orange to-cyber-indigo text-white border-cyber-orange hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-[1.02]"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${demoState.isActive ? "animate-spin" : ""}`} />
            {demoState.isActive ? "RUNNING TOUR..." : "RUN GUIDED 90S DEMO"}
          </button>
        </div>
      </header>

      {/* Demo Mode Overlay Banner */}
      {demoState.isActive && (
        <div className="bg-cyber-orange border-b border-orange-600 px-6 py-3 text-center flex items-center justify-center gap-3 animate-pulse font-mono text-xs font-extrabold text-black z-30 print:hidden">
          <Cpu className="w-4 h-4 animate-spin-slow" />
          <span>{demoState.text}</span>
        </div>
      )}

      {/* Dashboard Main Grid Layout */}
      <main className="flex-1 px-6 mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6 print:block print:px-0 print:mt-0">
        {/* Left Side: Telemetry & Shocks */}
        <div className="flex flex-col gap-6 print:hidden">
          {/* Module 1: Geopolitical Intelligence */}
          <div className={demoState.step === 1 || demoState.step === 2 ? "ring-2 ring-cyber-orange glow-amber rounded-lg" : ""}>
            <RiskIntelligence
              corridors={corridors}
              signals={signals}
              brentPrice={brentPrice}
              brentSource={brentSource}
              isLoading={isLoadingRisk}
              onRefresh={fetchRiskIntelligence}
            />
          </div>

          {/* Module 2: Scenario Modeller */}
          <div className={demoState.step === 3 ? "ring-2 ring-cyber-orange glow-amber rounded-lg" : ""}>
            <ScenarioModeller
              activeScenarioId={activeScenarioId}
              customCapacityLoss={customCapacityLoss}
              impact={impact}
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
        </div>

        {/* Right Side: Options & Briefings */}
        <div className="flex flex-col gap-6 print:block print:p-0">
          {/* Module 3: Procurement Orchestrator */}
          <div className={`print:hidden ${demoState.step === 4 ? "ring-2 ring-cyber-orange glow-amber rounded-lg" : ""}`}>
            <ProcurementOrchestrator
              options={procurementOptions}
              isLoading={isLoadingProcurement}
            />
          </div>

          {/* Module 4: Executive Policy Memo */}
          <div className={demoState.step === 5 ? "ring-2 ring-cyber-orange glow-amber rounded-lg" : ""}>
            <ExecutiveMemo
              memo={memo}
              isLoading={isLoadingMemo}
              onGenerate={() =>
                triggerFullPipeline(activeScenarioId, customCapacityLoss)
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
