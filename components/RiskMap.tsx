"use client";

import React, { useState } from "react";
import { AlertTriangle, Compass, MapPin } from "lucide-react";

interface CorridorState {
  name: string;
  score: number;
  status: "STABLE" | "WARNING" | "CRITICAL";
  description: string;
}

interface RiskMapProps {
  corridors: {
    Hormuz?: CorridorState;
    "Red Sea"?: CorridorState;
    Suez?: CorridorState;
  };
  activeCorridor: string | null;
  onSelectCorridor: (corridorKey: string | null) => void;
}

export default function RiskMap({ corridors, activeCorridor, onSelectCorridor }: RiskMapProps) {
  const [hoveredCorridor, setHoveredCorridor] = useState<string | null>(null);

  // Default coordinate nodes for highlights
  const nodes = {
    Hormuz: { x: 340, y: 160, label: "Strait of Hormuz", key: "Hormuz" },
    "Red Sea": { x: 230, y: 250, label: "Red Sea / Bab-el-Mandeb", key: "Red Sea" },
    Suez: { x: 180, y: 150, label: "Suez Canal", key: "Suez" },
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "CRITICAL":
        return "text-cyber-red stroke-cyber-red fill-cyber-red";
      case "WARNING":
        return "text-cyber-amber stroke-cyber-amber fill-cyber-amber";
      case "STABLE":
      default:
        return "text-cyber-green stroke-cyber-green fill-cyber-green";
    }
  };

  const getStatusBg = (status?: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-cyber-red/20 border-cyber-red text-cyber-red";
      case "WARNING":
        return "bg-cyber-amber/20 border-cyber-amber text-cyber-amber";
      case "STABLE":
      default:
        return "bg-cyber-green/20 border-cyber-green text-cyber-green";
    }
  };

  const getCorridorStatus = (key: string) => {
    return corridors[key as keyof typeof corridors] || {
      name: key,
      score: 15,
      status: "STABLE" as const,
      description: ""
    };
  };

  return (
    <div className="relative w-full h-[320px] md:h-[400px] border border-cyber-border rounded-lg bg-cyber-card overflow-hidden">
      {/* HUD Watermark */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
        <Compass className="w-4 h-4 text-cyber-blue animate-spin-slow" />
        <span className="text-[10px] tracking-widest text-cyber-blue font-mono font-bold uppercase">
          Sentinel-47 // Maritime Risk Projection HUD
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-[9px] text-gray-400 font-mono">Stable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-amber animate-pulse" />
          <span className="text-[9px] text-gray-400 font-mono">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-red animate-pulse" />
          <span className="text-[9px] text-gray-400 font-mono">Critical</span>
        </div>
      </div>

      {/* Main Vector Map Canvas */}
      <svg
        viewBox="0 0 800 450"
        className="w-full h-full select-none"
        style={{ background: "#050814" }}
      >
        {/* Grid Overlay */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.03)" strokeWidth="1" />
          </pattern>
          <linearGradient id="ocean-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#050814" />
            <stop offset="100%" stopColor="#08112d" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#ocean-glow)" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Landmass Outlines */}
        {/* Northeast Africa */}
        <path
          d="M -10,50 L 50,50 L 80,70 L 150,70 L 180,120 L 175,190 L 220,230 L 245,280 L 290,320 L 280,380 L 230,370 L 190,310 L 170,320 L 150,250 L 130,240 L 100,220 L 70,170 L -10,130 Z"
          fill="#0c1428"
          stroke="#1e293b"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Arabian Peninsula */}
        <path
          d="M 180,140 L 280,110 L 330,140 L 355,200 L 310,260 L 245,260 L 225,235 L 185,195 Z"
          fill="#0e1b35"
          stroke="#1e293b"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Iran / Central Asia / Southern Asia */}
        <path
          d="M 280,110 L 340,110 L 350,140 L 400,130 L 480,150 L 530,120 L 580,160 L 560,190 L 510,200 L 470,200 L 420,170 L 350,160 L 340,140 L 300,130 Z"
          fill="#0d1830"
          stroke="#1e293b"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* India */}
        <path
          d="M 525,170 L 570,170 L 575,210 L 600,230 L 635,310 L 640,340 L 635,350 L 620,370 L 610,350 L 590,290 L 580,250 L 550,230 L 535,200 Z"
          fill="#112244"
          stroke="#334155"
          strokeWidth="2"
          opacity="0.9"
        />

        {/* Indian Ports Indicators */}
        <g transform="translate(600, 240)">
          <circle r="4" fill="#06b6d4" className="animate-ping" />
          <circle r="3" fill="#06b6d4" />
          <text x="8" y="3" className="font-mono text-[9px] fill-gray-400 font-semibold">Jamnagar Ref.</text>
        </g>
        <g transform="translate(605, 275)">
          <circle r="3" fill="#06b6d4" />
          <text x="8" y="3" className="font-mono text-[9px] fill-gray-400 font-semibold">Mumbai Port</text>
        </g>
        <g transform="translate(635, 335)">
          <circle r="3" fill="#06b6d4" />
          <text x="8" y="3" className="font-mono text-[9px] fill-gray-400 font-semibold">Kochi Ref.</text>
        </g>

        {/* Shipping Routes (Tanker Lanes) */}
        {/* Route 1: Hormuz to Jamnagar */}
        <path
          d="M 340,160 Q 450,210 595,238"
          fill="none"
          stroke={activeCorridor === "Hormuz" || hoveredCorridor === "Hormuz" ? "#06b6d4" : "#1e293b"}
          strokeWidth={activeCorridor === "Hormuz" || hoveredCorridor === "Hormuz" ? "2.5" : "1.5"}
          strokeDasharray="5,5"
          className={activeCorridor === "Hormuz" || hoveredCorridor === "Hormuz" ? "stroke-cyber-blue" : ""}
        />

        {/* Route 2: Bab-el-Mandeb (Red Sea) to Mumbai */}
        <path
          d="M 230,250 Q 420,270 600,273"
          fill="none"
          stroke={activeCorridor === "Red Sea" || hoveredCorridor === "Red Sea" ? "#06b6d4" : "#1e293b"}
          strokeWidth={activeCorridor === "Red Sea" || hoveredCorridor === "Red Sea" ? "2.5" : "1.5"}
          strokeDasharray="5,5"
        />

        {/* Route 3: Suez Canal through Red Sea to Kochi */}
        <path
          d="M 180,150 L 210,210 L 230,250 Q 430,310 630,332"
          fill="none"
          stroke={activeCorridor === "Suez" || hoveredCorridor === "Suez" ? "#06b6d4" : "#1e293b"}
          strokeWidth={activeCorridor === "Suez" || hoveredCorridor === "Suez" ? "2.5" : "1.5"}
          strokeDasharray="5,5"
        />

        {/* Oil flow animations (animated dots) */}
        {getCorridorStatus("Hormuz").status !== "CRITICAL" && (
          <circle r="3.5" fill="#f59e0b">
            <animateMotion
              path="M 340,160 Q 450,210 595,238"
              begin="0s"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        {getCorridorStatus("Red Sea").status !== "CRITICAL" && (
          <circle r="3.5" fill="#ef4444">
            <animateMotion
              path="M 230,250 Q 420,270 600,273"
              begin="2s"
              dur="7s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        {getCorridorStatus("Suez").status !== "CRITICAL" && (
          <circle r="3.5" fill="#10b981">
            <animateMotion
              path="M 180,150 L 210,210 L 230,250 Q 430,310 630,332"
              begin="1s"
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Corridor Radar Nodes */}
        {Object.values(nodes).map((node) => {
          const stats = getCorridorStatus(node.key);
          const isSelected = activeCorridor === node.key;
          const isHovered = hoveredCorridor === node.key;
          const strokeColorClass = getStatusColor(stats.status);

          return (
            <g
              key={node.key}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              onClick={() => onSelectCorridor(isSelected ? null : node.key)}
              onMouseEnter={() => setHoveredCorridor(node.key)}
              onMouseLeave={() => setHoveredCorridor(null)}
            >
              {/* Pulsing Outer Rings */}
              <circle
                r={isSelected || isHovered ? "28" : "18"}
                fill="none"
                strokeWidth="1"
                className={`animate-ping opacity-25 ${strokeColorClass}`}
                style={{ animationDuration: stats.status === "CRITICAL" ? "1.2s" : "2.5s" }}
              />
              <circle
                r={isSelected || isHovered ? "18" : "12"}
                fill="none"
                strokeWidth="1.5"
                className={`opacity-40 ${strokeColorClass}`}
              />

              {/* Inner Node Core */}
              <circle
                r="6"
                className={`stroke-cyber-bg stroke-2 ${strokeColorClass}`}
              />

              {/* Text Label Backdrop */}
              <rect
                x="-50"
                y="-28"
                width="100"
                height="15"
                rx="3"
                fill="rgba(3, 7, 18, 0.85)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                className={isSelected || isHovered ? "opacity-100" : "opacity-75"}
              />

              {/* Text Title */}
              <text
                y="-18"
                textAnchor="middle"
                className="font-mono text-[8px] fill-gray-200 font-bold uppercase tracking-wider"
              >
                {node.key} ({stats.score}%)
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected/Hovered Corridor Details Overlay Card */}
      {(() => {
        const activeKey = hoveredCorridor || activeCorridor;
        if (!activeKey) return null;
        const stats = getCorridorStatus(activeKey);
        const colorClass = getStatusColor(stats.status);
        const bgClass = getStatusBg(stats.status);

        return (
          <div className="absolute bottom-4 left-4 right-4 z-20 cyber-panel p-3 rounded border border-cyber-border glow-blue transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono tracking-wider text-white uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyber-blue" />
                  {stats.name}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1 font-sans">{stats.description}</p>
              </div>
              <div className="text-right">
                <div className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${bgClass}`}>
                  DISRUPTION PROBABILITY: {stats.score}%
                </div>
                <div className="text-[9px] text-gray-500 font-mono mt-1">STATUS: {stats.status}</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
