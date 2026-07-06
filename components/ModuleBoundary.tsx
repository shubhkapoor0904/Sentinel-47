"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  moduleName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ModuleBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[Module Boundary Fault] Error in ${this.props.moduleName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-cyber-orange/30 bg-cyber-orange/[0.02] rounded-lg p-8 font-mono text-sm shadow-[0_0_20px_rgba(249,115,22,0.05)] text-left flex flex-col gap-4">
          <p className="text-cyber-orange font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-orange animate-pulse" />
            ⚠ {this.props.moduleName} — MODULE FAULT DETECTED
          </p>
          <div className="bg-[#0b0f19] border border-cyber-border/40 p-4 rounded text-xs text-gray-300 overflow-x-auto select-text leading-relaxed">
            <span className="text-cyber-red font-bold font-mono">Error: </span>
            {this.state.error?.message || "Unknown JS runtime exception"}
          </div>
          <p className="text-[10px] text-gray-500 italic">
            Sentinel-47 isolation protocol active: this fault has been contained. Other platforms and modules continue to run without interruption.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="self-start px-4 py-2 text-xs font-black border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] rounded uppercase transition-all duration-200"
          >
            REINITIALIZE MODULE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
