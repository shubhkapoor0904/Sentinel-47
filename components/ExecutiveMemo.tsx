"use client";

import React, { useRef } from "react";
import { Download, FileText, Printer, ShieldAlert } from "lucide-react";

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

interface ExecutiveMemoProps {
  memo: MemoStructure;
  isLoading: boolean;
  onGenerate: () => void;
}

export default function ExecutiveMemo({ memo, isLoading, onGenerate }: ExecutiveMemoProps) {
  const memoRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="cyber-panel p-6 rounded-lg border border-cyber-border h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-indigo/10 border border-cyber-indigo/30 flex items-center justify-center text-cyber-indigo">
            <FileText className="w-4 h-4" />
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
            disabled={isLoading}
            className="px-3 py-1.5 bg-cyber-indigo/20 hover:bg-cyber-indigo/30 border border-cyber-indigo/40 hover:border-cyber-indigo rounded transition-all text-xs font-mono font-bold text-cyber-indigo hover:text-white disabled:opacity-50"
          >
            {isLoading ? "COMPILING..." : "RE-COMPILE BRIEF"}
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

      {/* Official Memo Sheet Wrapper */}
      <div className="flex-1 overflow-y-auto max-h-[500px] border border-cyber-border/80 bg-white text-gray-900 p-6 sm:p-8 rounded shadow-2xl font-serif text-left print:p-0 print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black">
        <div ref={memoRef} className="flex flex-col gap-6 max-w-2xl mx-auto print:mx-0 print:max-w-none">
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
            <div className="col-span-5 text-gray-950 font-bold uppercase underline">
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
          </div>

          {/* Signature Block */}
          <div className="mt-8 border-t border-gray-200 pt-4 flex flex-col items-end text-right font-sans">
            <div className="w-[200px] border-b border-gray-400 h-10 print:h-8" />
            <span className="text-[10px] font-bold text-gray-900 mt-1 uppercase">
              {memo.signature}
            </span>
            <span className="text-[9px] text-gray-500 uppercase">
              Sentinel-47 Decision Synthesis Engine
            </span>
          </div>
        </div>
      </div>

      {/* CSS Print Styles to Isolate the Memo Document */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          /* Make sure ONLY the memo text sheet is shown and printed */
          .print\\:hidden {
            display: none !important;
          }
          /* Target the memo content container and make it visible */
          div[ref] {
            visibility: visible !important;
          }
          /* Style container for fullscreen page print */
          div.font-serif {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            visibility: visible !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          div.font-serif * {
            visibility: visible !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
