# Sentinel-47 // Command Control

**Sentinel-47** is an integrated geopolitical risk assessment and crude oil supply-chain resilience dashboard. Designed for high-stakes decision support (e.g. the Ministry of Petroleum & Natural Gas, Government of India), the system stress-tests national supply chains, models cascading macroeconomic impacts, evaluates alternative procurement channels, and synthesizes printable briefing directives in real-time.

---

## 🚀 Key System Features

- **1. Geopolitical Risk Scanning (Module 1)**: Renders live chokepoint threat logs (Suez, Hormuz, Red Sea) and a pulsing vector corridor map highlighting security alerts.
- **2. Disruption Stress Modeller (Module 2)**: Stress-tests domestic capacity under shock presets or custom drops. Metric cards display ranges with a uniform ±15% spread, using horizontal shaded bands and thin point-estimate line indicators.
- **3. Adaptive Procurement Orchestrator (Module 3)**: Dynamically ranks alternative importing avenues using a simulated Cost vs. Security stakeholder agentic debate with staggered typing animations.
- **4. Executive Decision Memo (Module 4)**: Auto-generates a formal ministerial memo, benchmarked against legacy decision latency, ready to print as a clean document PDF.
- **5. Sentinel Resilience Index**: A persistent composite national score (0-100) aggregating live threat telemetry and simulated stress components (`0.30 Corridor + 0.30 SPR + 0.25 Refinery + 0.15 GDP`). Click the badge for a detailed sub-score progress HUD popover.

---

## 📁 Core Folder Map

- `/app` — App router endpoints and mock API routes (`/api/risk`, `/api/scenario`, `/api/procurement`, `/api/memo`).
- `/components` — Visual React modules:
  - `RiskIntelligence.tsx` & `RiskMap.tsx` (Module 1)
  - `ScenarioModeller.tsx` (Module 2)
  - `ProcurementOrchestrator.tsx` (Module 3)
  - `ExecutiveMemo.tsx` (Module 4)
  - `AnimatedNumber.tsx` (Ease-out counters)
- `project_walkthrough.md` — Highly detailed developer onboarding and formula guide.

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have Node.js installed (v18+ recommended).

### Installation
1. Install package dependencies:
   ```bash
   npm install
   ```
2. Start the local Next.js development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
Validate typescript compiler compliance and optimize the build:
```bash
npm run build
```

---

## 📖 Complete Documentation
For an in-depth breakdown of calculations, sub-score normalization formulas, state pipelines, and visual layout features, please review the developer guide:

👉 **[project_walkthrough.md](file:///d:/et_ai/project_walkthrough.md)**
