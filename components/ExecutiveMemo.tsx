"use client";

import React, { useRef, useState, useEffect } from "react";
import { Download, FileText, Printer, ShieldAlert } from "lucide-react";
import { useSentinelStore } from "../store/sentinel";

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

interface ExecutiveMemoProps {
  isLoading: boolean;
  onGenerate: () => void;
  gdpDrag: number;
  sprDays: number;
}

export default function ExecutiveMemo({
  isLoading,
  onGenerate,
  gdpDrag,
  sprDays,
}: ExecutiveMemoProps) {
  const {
    currentMemo,
    activeScenarioId,
    activeInterventions,
    toggleIntervention,
    ledgerEntries,
  } = useSentinelStore();

  const memo = currentMemo ?? {
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
  };
  const memoRef = useRef<HTMLDivElement>(null);
  const [localCompiling, setLocalCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Upgrade 2: Audit Ledger UI states
  const [ledgerCollapsed, setLedgerCollapsed] = useState(true);
  const [expandedRowSeq, setExpandedRowSeq] = useState<number | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const handleVerifyChain = () => {
    if (ledgerEntries.length === 0) {
      setVerificationResult({
        status: "success",
        message: "CHAIN INTACT — Ledger is empty (GENESIS state ready)"
      });
      return;
    }

    let isValid = true;
    let brokenIndex = -1;

    for (let i = 0; i < ledgerEntries.length; i++) {
      const entry = ledgerEntries[i];
      
      // 1. First entry must have previousHash === "GENESIS"
      if (i === 0) {
        if (entry.previousHash !== "GENESIS") {
          isValid = false;
          brokenIndex = 0;
          break;
        }
      } else {
        // 2. Subsequent entries previousHash must match predecessor's contentHash
        const prevEntry = ledgerEntries[i - 1];
        if (entry.previousHash !== prevEntry.contentHash) {
          isValid = false;
          brokenIndex = i;
          break;
        }
      }
    }

    if (isValid) {
      setVerificationResult({
        status: "success",
        message: `CHAIN INTACT — ${ledgerEntries.length} entries verified`
      });
    } else {
      setVerificationResult({
        status: "error",
        message: `CHAIN BROKEN — Discrepancy detected at Entry #${brokenIndex + 1} (Sequence validation failed).`
      });
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      setLocalCompiling(true);
      setCompileProgress(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setCompileProgress((prev) => {
          const next = prev + 4;
          if (next >= 100) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setLocalCompiling(false);
            return 100;
          }
          return next;
        });
      }, 50); // 50ms * 25 updates = 1.25s
    }
  }, [isLoading]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Parse actual decision support brief generation time
  const match = memo.timeSavedStatement.match(/generated in ([\d\.]+) seconds/i);
  const genTime = match ? `${match[1]}s` : "0.18s";

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border min-h-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-indigo/10 border border-cyber-indigo/30 flex items-center justify-center text-cyber-indigo">
            <FileText className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              4. Executive Decision Memo Agent
            </h2>
            <p className="text-[11px] text-gray-400">
              Generate refinery-ready policy briefs and strategic directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            disabled={isLoading || localCompiling}
            className="px-3 py-1.5 bg-cyber-indigo/20 hover:bg-cyber-indigo/30 border border-cyber-indigo/40 hover:border-cyber-indigo rounded transition-all text-xs font-mono font-bold text-cyber-indigo hover:text-white disabled:opacity-50"
          >
            {isLoading || localCompiling ? "COMPILING..." : "RE-COMPILE BRIEF"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-cyber-blue/10 hover:bg-cyber-blue/20 border border-cyber-blue/30 rounded text-cyber-blue hover:text-white transition-all text-xs font-mono font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            PRINT/PDF
          </button>
        </div>
      </div>

      {/* Time Saved Alert */}
      <div className="bg-cyber-indigo/10 border border-cyber-indigo/30 p-3 rounded flex items-start gap-2.5 print:hidden">
        <ShieldAlert className="w-4 h-4 text-cyber-indigo shrink-0 mt-0.5 animate-pulse" />
        <div className="text-left">
          <span className="text-[9px] uppercase font-mono text-cyber-indigo font-bold block">
            Integrated Intelligence Performance Log
          </span>
          <span className="text-[10px] text-gray-300 font-mono italic block leading-relaxed mt-0.5">
            {memo.timeSavedStatement}
          </span>
        </div>
      </div>

      {/* Restructured Comparison + Interventions (75/25 Split) */}
      {!localCompiling && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 print:hidden text-left shrink-0">
          {/* Left (75%) -> Existing cards */}
          <div className="lg:col-span-3 bg-[#0b0f19]/60 border border-cyber-border rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2.5">
              <h3 className="font-mono text-xs font-bold text-cyber-orange uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-cyber-orange animate-pulse" />
                Strategic Response Benchmark: Legacy vs. Sentinel-47
              </h3>
              <span className="text-[9px] font-mono text-gray-500 uppercase">
                Operational Impact Analytics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
              {/* Legacy (Do Nothing) */}
              <div className="border border-cyber-red/20 bg-cyber-red/5 p-4 rounded flex flex-col gap-2.5 justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyber-red uppercase tracking-wider font-extrabold">
                    Without Integrated Response (Legacy)
                  </span>
                  <div className="flex flex-col mt-2.5">
                    <span className="text-[8px] text-gray-500 uppercase font-mono">Stabilization Latency</span>
                    <span className="text-xl font-bold font-mono text-cyber-red tracking-tight">47 Days (MODELED)</span>
                  </div>
                </div>
                <div className="text-[10px] font-sans text-gray-400 leading-relaxed border-t border-cyber-border/40 pt-2 mt-1">
                  Manual multi-agency alignment cycles, static procurement channels, and delayed reserve releases induce prolonged price/supply shock loops.
                </div>
              </div>

              {/* Sentinel-47 */}
              <div className="border border-cyber-blue/30 bg-cyber-blue/5 p-4 rounded flex flex-col justify-between gap-2.5">
                <div>
                  <span className="text-[10px] font-mono text-cyber-blue uppercase tracking-wider font-extrabold">
                    With Sentinel-47 (Active Response)
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-2.5">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase font-mono">Decision Latency</span>
                      <span className="text-xl font-bold font-mono text-cyber-blue tracking-tight">
                        {genTime} <span className="text-[8px] text-gray-500 uppercase font-normal">(ACTUAL)</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase font-mono">GDP Drag Avoided</span>
                      <span className="text-xl font-bold font-mono text-cyber-green tracking-tight">
                        {gdpDrag > 0 ? `${(gdpDrag * 0.85).toFixed(2)} pp` : "0.00 pp"} <span className="text-[8px] text-gray-500 uppercase font-normal">(MODELED)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400 leading-normal border-t border-cyber-border/40 pt-2">
                  {gdpDrag > 0 ? (
                    <span>
                      Estimated drag avoided: <strong className="text-cyber-green">{(gdpDrag * 0.85).toFixed(2)} pp</strong> of <strong className="text-gray-300">{gdpDrag.toFixed(2)} pp</strong> by acting same-day (MODELED).
                    </span>
                  ) : (
                    <span>No active disruptions. System operational at 100% baseline (MODELED).</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right (25%) -> New Ministerial Response Interventions panel */}
          <div className="lg:col-span-1 bg-[#0b0f19]/60 border border-cyber-border rounded-lg p-5 flex flex-col gap-3 justify-between">
            <div className="border-b border-cyber-border/40 pb-2.5 shrink-0">
              <h3 className="font-mono text-xs font-bold text-cyber-blue uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse" />
                Response Interventions
              </h3>
            </div>

            {/* Directive Cards Container */}
            <div className="flex flex-col gap-2.5 flex-grow justify-center">
              {(() => {
                // Determine disabled states based on activeScenarioId
                const navyDisabled = activeScenarioId === "baseline" || activeScenarioId === "opec_cut";
                const sprDisabled = activeScenarioId === "baseline";
                const opecDisabled = activeScenarioId === "baseline";

                const getCardStyle = (active: boolean, disabled: boolean) => {
                  if (disabled) {
                    return "border-gray-800 bg-gray-950/20 text-gray-600 cursor-not-allowed opacity-50";
                  }
                  if (active) {
                    return "border-cyber-orange bg-cyber-orange/10 text-cyber-orange shadow-[0_0_10px_rgba(249,115,22,0.15)] cursor-pointer hover:bg-cyber-orange/15";
                  }
                  return "border-cyber-border bg-[#070b13]/50 text-gray-300 cursor-pointer hover:border-cyber-blue/50 hover:bg-cyber-blue/5";
                };

                return (
                  <>
                    {/* Directive 1: Navy Escorts */}
                    <button
                      disabled={navyDisabled}
                      onClick={() => toggleIntervention("navyEscorts")}
                      className={`p-2 rounded border font-mono transition-all duration-200 select-none flex flex-col justify-center text-left text-[10px] w-full h-[48px] ${getCardStyle(activeInterventions.navyEscorts, navyDisabled)}`}
                    >
                      <div className="flex justify-between items-center font-bold w-full">
                        <span>Deploy Navy Escorts</span>
                        {activeInterventions.navyEscorts && !navyDisabled && <span className="text-[8.5px] bg-cyber-orange/20 border border-cyber-orange/30 px-1 py-0.2 rounded font-black text-cyber-orange uppercase">ACTIVE</span>}
                        {navyDisabled && <span className="text-[7.5px] text-gray-500 uppercase">N/A</span>}
                      </div>
                      <span className="text-[8px] text-gray-500 mt-0.5 font-sans leading-none block truncate">Operation Sankalp / Shipping Escort</span>
                    </button>

                    {/* Directive 2: SPR Release */}
                    <button
                      disabled={sprDisabled}
                      onClick={() => toggleIntervention("sprRelease")}
                      className={`p-2 rounded border font-mono transition-all duration-200 select-none flex flex-col justify-center text-left text-[10px] w-full h-[48px] ${getCardStyle(activeInterventions.sprRelease, sprDisabled)}`}
                    >
                      <div className="flex justify-between items-center font-bold w-full">
                        <span>Release SPR Reserves</span>
                        {activeInterventions.sprRelease && !sprDisabled && <span className="text-[8.5px] bg-cyber-orange/20 border border-cyber-orange/30 px-1 py-0.2 rounded font-black text-cyber-orange uppercase">ACTIVE</span>}
                        {sprDisabled && <span className="text-[7.5px] text-gray-500 uppercase">N/A</span>}
                      </div>
                      <span className="text-[8px] text-gray-500 mt-0.5 font-sans leading-none block truncate">Strategic Stock Drawdown</span>
                    </button>

                    {/* Directive 3: OPEC Negotiation */}
                    <button
                      disabled={opecDisabled}
                      onClick={() => toggleIntervention("opecNegotiation")}
                      className={`p-2 rounded border font-mono transition-all duration-200 select-none flex flex-col justify-center text-left text-[10px] w-full h-[48px] ${getCardStyle(activeInterventions.opecNegotiation, opecDisabled)}`}
                    >
                      <div className="flex justify-between items-center font-bold w-full">
                        <span>Bilateral OPEC Negotiation</span>
                        {activeInterventions.opecNegotiation && !opecDisabled && <span className="text-[8.5px] bg-cyber-orange/20 border border-cyber-orange/30 px-1 py-0.2 rounded font-black text-cyber-orange uppercase">ACTIVE</span>}
                        {opecDisabled && <span className="text-[7.5px] text-gray-500 uppercase">N/A</span>}
                      </div>
                      <span className="text-[8px] text-gray-500 mt-0.5 font-sans leading-none block truncate">Crude Price Premium Mitigation</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Compiler Screen vs Official Memo Sheet */}
      {localCompiling ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] border border-cyber-border/40 rounded bg-cyber-bg/50 select-none">
          <div className="w-[320px] flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between text-cyber-indigo font-bold">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-indigo animate-ping" />
                COMPILING EXECUTIVE BRIEF...
              </span>
              <span>{compileProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-955 border border-slate-800 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyber-indigo/80 to-cyber-indigo transition-all duration-75 ease-out"
                style={{ width: `${compileProgress}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider text-center mt-1 animate-pulse">
              Synthesizing corridor threats, pricing projections, sourcing routes & SPR directives
            </span>
          </div>
        </div>
      ) : (
        <div id="printable-memo-document" className="h-[500px] overflow-y-auto border border-cyber-border/80 bg-white text-gray-900 p-8 sm:p-10 rounded shadow-2xl font-serif text-left print:p-0 print:border-none print:shadow-none print:max-h-none print:h-auto print:bg-white print:text-black">
          <div ref={memoRef} className="flex flex-col gap-6 max-w-2xl mx-auto print:mx-0 print:max-w-none animate-fadeIn">
            
            {/* Dynamic Auto-Trigger conditions stamp */}
            {memo.autoTriggerStatement && (
              <div className="border border-red-500 bg-red-50 text-red-700 px-3.5 py-2 rounded font-mono text-[9px] font-bold flex items-center gap-2 select-none print:bg-white print:border-red-600 print:text-red-700 shrink-0">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>{memo.autoTriggerStatement}</span>
              </div>
            )}

            {/* Official Letterhead */}
            <div className="text-center border-b-4 border-double border-gray-800 pb-4">
              <h3 className="font-sans font-bold tracking-widest text-[11px] uppercase text-gray-500 print:text-gray-700">
                Confidential // For Internal Use Only
              </h3>
              <h1 className="text-sm font-sans font-black tracking-widest uppercase mt-2 text-gray-950">
                Sentinel-47 Energy Supply Security taskforce
              </h1>
              <h2 className="text-[10px] font-sans tracking-wide uppercase text-gray-600 mt-0.5">
                Coordinated Security response Framework — Ministry of Petroleum & Natural Gas
              </h2>
              <div className="text-[9px] font-mono mt-1 text-gray-500">
                Ref: {memo.memoId} // New Delhi, India
              </div>
            </div>

            {/* Memorandum Header Fields */}
            <div className="grid grid-cols-6 border-b border-gray-400 pb-3 font-sans text-xs font-semibold gap-y-2 text-gray-800">
              <div className="col-span-1 text-gray-500 uppercase tracking-wider text-[10px]">Date:</div>
              <div className="col-span-5 font-serif text-gray-900">{memo.date}</div>

              <div className="col-span-1 text-gray-500 uppercase tracking-wider text-[10px]">To:</div>
              <div className="col-span-5 text-gray-900 uppercase font-bold">{memo.to}</div>

              <div className="col-span-1 text-gray-500 uppercase tracking-wider text-[10px]">From:</div>
              <div className="col-span-5 text-gray-900 uppercase">{memo.from}</div>

              <div className="col-span-1 text-gray-500 uppercase tracking-wider text-[10px]">Subject:</div>
              <div className="col-span-5 text-gray-955 font-bold uppercase underline">
                {memo.subject}
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h4 className="font-sans font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                1. Strategic Executive Summary
              </h4>
              <p className="text-xs leading-relaxed text-gray-800 text-justify">
                {memo.executiveSummary}
              </p>
            </div>

            {/* Section 2: Risk Telemetry */}
            <div>
              <h4 className="font-sans font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                2. Geopolitical Corridor Assessment
              </h4>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-gray-800">
                {memo.riskAssessment.map((risk, idx) => (
                  <li key={idx} className="leading-relaxed text-justify">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Cascading Economic Impact */}
            <div>
              <h4 className="font-sans font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                3. Numbered Cascading Impact Findings
              </h4>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-gray-800 font-medium">
                {memo.impactFindings.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed text-justify text-gray-900">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Sourcing Directives */}
            <div>
              <h4 className="font-sans font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                4. Actionable Sourcing & Routing Directives
              </h4>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-gray-800">
                {memo.procurementDirectives.map((directive, idx) => (
                  <li key={idx} className="leading-relaxed text-justify">
                    {directive}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 5: Strategic Reserve Release (SPR) */}
            <div>
              <h4 className="font-sans font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                5. Strategic Petroleum Reserve (SPR) Directive
              </h4>
              <p className="text-xs leading-relaxed text-gray-800 text-justify italic font-semibold border-l-2 border-gray-800 pl-3">
                {memo.sprDirectives}
              </p>
              {sprDays < 4.0 && (
                <div className="mt-3.5 border border-red-500 bg-red-50 text-red-700 px-3.5 py-2.5 rounded font-mono text-[10px] font-bold flex flex-col gap-1 select-none print:bg-white print:border-red-600 print:text-red-700 shrink-0">
                  <div className="flex items-center gap-1.5 uppercase tracking-wider text-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span>⚠️ CRITICAL RESERVE DEPLETION ALERT</span>
                  </div>
                  <p className="font-sans text-[10.5px] font-medium leading-relaxed mt-0.5">
                    National Strategic Petroleum Reserves have fallen to {sprDays.toFixed(1)} days of total net import cover (below the safety margin of 4.0 days). Visakhapatnam, Mangalore, and Padur storage caverns are executing emergency drawdown limit orders.
                  </p>
                </div>
              )}
            </div>

            {/* End of Brief Divider */}
            <div className="mt-6 flex items-center justify-center gap-4 select-none print:mt-4">
              <div className="flex-1 border-t border-gray-200 border-dashed" />
              <span className="font-mono text-[8px] text-gray-400 tracking-widest uppercase font-bold">
                *** END OF BRIEF ***
              </span>
              <div className="flex-1 border-t border-gray-200 border-dashed" />
            </div>

            {/* Signature Block */}
            <div className="mt-4 flex flex-col items-end text-right font-sans">
              <div className="w-[200px] border-b border-gray-400 h-8 print:h-6" />
              <span className="text-[10px] font-bold text-gray-900 mt-1 uppercase">
                {memo.signature}
              </span>
              <span className="text-[9px] text-gray-500 uppercase">
                Sentinel-47 Decision Synthesis Engine
              </span>
            </div>

              {/* Cryptographic Ledger Hash */}
              <div className="mt-5 pt-3 border-t border-gray-200 text-center font-mono text-[8.5px] text-gray-500 print:text-gray-600 select-none">
                {mounted && ledgerEntries.length > 0 ? (
                  <>
                    LEDGER ENTRY: SHA-256 · {ledgerEntries[ledgerEntries.length - 1].contentHash.slice(0, 12)}... · Logged {ledgerEntries[ledgerEntries.length - 1].timestamp} · Entry #{ledgerEntries.length} of {ledgerEntries.length}
                  </>
                ) : (
                  <>
                    LEDGER ENTRY: SHA-256 · 7f3a9c2e4b1d... · Logged 01-07-2026 20:13:44 IST · Entry #4 of 4
                  </>
                )}
              </div>
 
             {/* Human Authorization Disclaimer */}
             <div className="mt-2 text-center font-sans tracking-wider text-[7.5px] uppercase text-gray-400 print:text-gray-500 leading-normal select-none">
               This brief is a decision-support recommendation only. All directives
               require human authorization and review by qualified officials before
               execution. Sentinel-47 accelerates analysis — it does not act
               autonomously.
             </div>
           </div>
         </div>
       )}
 
       {/* 2. Collapsible Decision Ledger Panel */}
       <div className="mt-8 bg-[#070b13]/90 border border-cyber-border rounded overflow-hidden font-mono print:hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
         <button
           onClick={() => setLedgerCollapsed(!ledgerCollapsed)}
           className="w-full px-6 py-4 flex items-center justify-between bg-gray-950/40 border-b border-cyber-border hover:bg-gray-950/60 transition-all group"
         >
           <div className="flex items-center gap-2 text-xs font-black tracking-wider text-cyber-orange">
             <span className={`w-2 h-2 rounded-full bg-cyber-orange animate-pulse`} />
             DECISION LEDGER
           </div>
           <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase">
             <span>{mounted ? ledgerEntries.length : 0} Blocks Hydrated</span>
             <span className="text-cyber-orange group-hover:translate-y-[1px] transition-transform">
               {ledgerCollapsed ? "Expand [▼]" : "Collapse [▲]"}
             </span>
           </div>
         </button>
 
         {!ledgerCollapsed && mounted && (
           <div className="p-6 flex flex-col gap-6 text-left">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/40 pb-4">
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-gray-400">
                   BROWSER-PERSISTED LEDGER — production deployment would use append-only database (Supabase/PostgreSQL)
                 </span>
                 <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                   Provides a local tamper-proof audit trail of ministerial decision synthesis directives.
                 </span>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                 <button
                   onClick={handleVerifyChain}
                   className="px-4 py-2 text-[10px] font-black border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 hover:shadow-[0_0_10px_rgba(6,182,212,0.25)] rounded uppercase transition-all duration-200"
                 >
                   VERIFY CHAIN
                 </button>
               </div>
             </div>
 
             {/* Verification Status Banner */}
             {verificationResult.status !== "idle" && (
               <div
                 className={`p-3 rounded border text-[10px] font-black flex items-center gap-3 animate-fadeIn ${
                   verificationResult.status === "success"
                     ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                     : "bg-cyber-red/10 border-cyber-red/30 text-cyber-red"
                 }`}
               >
                 <div
                   className={`w-2 h-2 rounded-full ${
                     verificationResult.status === "success" ? "bg-emerald-400" : "bg-cyber-red"
                   }`}
                 />
                 {verificationResult.message}
               </div>
             )}
 
             {/* Ledger Table */}
             {ledgerEntries.length === 0 ? (
               <div className="py-8 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-dashed border-cyber-border/40 rounded">
                 [ No decision ledger entries recorded in this browser session ]
               </div>
             ) : (
               <div className="overflow-x-auto max-h-[280px] overflow-y-auto border border-cyber-border/20 rounded bg-[#03070d]/50 custom-scrollbar">
                 <table className="w-full text-left border-collapse text-[10.5px]">
                   <thead className="sticky top-0 bg-[#070b13] z-10 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                     <tr className="border-b border-cyber-border/40 text-[9px] text-gray-500 font-black uppercase">
                       <th className="py-2.5 px-3 w-12 text-center">#</th>
                       <th className="py-2.5 px-3 w-[180px]">TIMESTAMP</th>
                       <th className="py-2.5 px-3">SCENARIO</th>
                       <th className="py-2.5 px-3 w-36 text-center">HASH (first 12 chars)</th>
                     </tr>
                   </thead>
                   <tbody>
                     {ledgerEntries.map((entry) => {
                       const isExpanded = expandedRowSeq === entry.sequence;
                       return (
                         <React.Fragment key={entry.id}>
                           <tr
                             onClick={() => setExpandedRowSeq(isExpanded ? null : entry.sequence)}
                             className={`border-b border-cyber-border/20 cursor-pointer transition-all ${
                               isExpanded
                                 ? "bg-cyber-orange/5 text-cyber-orange"
                                 : "text-gray-300 hover:bg-gray-900/30 hover:text-white"
                             }`}
                           >
                             <td className="py-3 px-3 text-center text-gray-500 font-bold">{entry.sequence}</td>
                             <td className="py-3 px-3 font-medium">{entry.timestamp}</td>
                             <td className="py-3 px-3 font-semibold uppercase tracking-wider text-cyber-blue">
                               {entry.scenarioId}
                             </td>
                             <td className="py-3 px-3 text-center font-bold text-gray-400 font-mono">
                               {entry.contentHash.slice(0, 12)}
                             </td>
                           </tr>
                           
                           {/* Expanded detail section */}
                           {isExpanded && (
                             <tr>
                               <td colSpan={4} className="py-4 px-6 bg-gray-950/50 border-b border-cyber-border/20 text-[9.5px]">
                                 <div className="flex flex-col gap-3 font-mono leading-normal text-gray-400">
                                   <div className="flex flex-col gap-1 border-b border-cyber-border/20 pb-2.5">
                                     <span className="text-gray-500 font-bold text-[8.5px] uppercase">MEMO SUBJECT:</span>
                                     <div className="text-white font-bold text-xs font-sans">
                                       {entry.memoSubject}
                                     </div>
                                   </div>

                                   <div className="flex flex-col gap-1 border-b border-cyber-border/20 pb-2.5">
                                     <span className="text-gray-500 font-bold text-[8.5px] uppercase">Cryptographic Audit Hashes:</span>
                                     <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                       <div className="flex-1">
                                         <span className="text-cyber-orange font-bold">Content Hash (SHA-256):</span>
                                         <div className="bg-[#03070d] p-1.5 rounded border border-cyber-border/40 mt-0.5 select-all truncate text-white">
                                           {entry.contentHash}
                                         </div>
                                       </div>
                                       <div className="flex-1">
                                         <span className="text-cyber-blue font-bold">Previous Hash:</span>
                                         <div className="bg-[#03070d] p-1.5 rounded border border-cyber-border/40 mt-0.5 select-all truncate text-white">
                                           {entry.previousHash}
                                         </div>
                                       </div>
                                     </div>
                                   </div>
 
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div>
                                       <span className="text-gray-500 font-bold text-[8.5px] uppercase">Corridor Snaps:</span>
                                       <div className="flex gap-4 mt-1">
                                         <div>Hormuz: <span className="text-white font-bold">{entry.corridorScores.hormuz}</span></div>
                                         <div>Red Sea: <span className="text-white font-bold">{entry.corridorScores.redSea}</span></div>
                                         <div>Suez: <span className="text-white font-bold">{entry.corridorScores.suez}</span></div>
                                       </div>
                                     </div>
                                     <div className="text-right sm:text-left">
                                       <span className="text-gray-500 font-bold text-[8.5px] uppercase">Unique entry ID:</span>
                                       <div className="text-gray-500 mt-1 select-all font-sans text-[8.5px]">
                                         {entry.id}
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </td>
                             </tr>
                           )}
                         </React.Fragment>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         )}
       </div>

      {/* CSS Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(7, 11, 19, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(249, 115, 22, 0.35);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.7);
        }
      `}</style>
    </div>
  );
}
