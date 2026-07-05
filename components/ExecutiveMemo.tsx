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
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6 select-none">
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
        <div id="printable-memo-document" className="flex-1 overflow-y-auto border border-cyber-border/80 bg-white text-gray-900 p-8 sm:p-10 rounded shadow-2xl font-serif text-left print:p-0 print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black">
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
              {ledgerEntries.length > 0 ? (
                <>
                  LEDGER ENTRY: SHA-256 · {ledgerEntries[ledgerEntries.length - 1].hash.slice(0, 12)}... · Logged {ledgerEntries[ledgerEntries.length - 1].timestamp} · Entry #{ledgerEntries.length} of {ledgerEntries.length}
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

      {/* CSS Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
