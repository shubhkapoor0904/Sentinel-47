# Implementation Plan - Upgrade 5: Error Boundaries + Network Fallback

This plan implements a safety net for Sentinel-47. It adds client-side React Error Boundaries to prevent runtime JS exceptions in a single module from crashing the entire app. It also introduces local cached data fallbacks for Yahoo Finance / Brent prices and News API signals in case of network failures, complete with a notification banner in the Command Center header.

---

## Proposed Changes

### 1. React Error Boundary Component

#### [NEW] [ModuleBoundary.tsx](file:///d:/et_ai/components/ModuleBoundary.tsx)
- Create a client-side class component `ModuleBoundary` extending `React.Component`.
- Implement `getDerivedStateFromError` to set `{ hasError: true, error }`.
- Render a cyber-themed fallback UI with the module name, error message, and a **REINITIALIZE MODULE** action button to reset state.

---

### 2. Layout Integration (Module Wrapping)

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Import `ModuleBoundary` from `../components/ModuleBoundary`.
- Wrap each of the 4 vertical navigation view containers with `<ModuleBoundary moduleName="...">`:
  - Module 1: `1. GEOPOLITICAL RISK AGENT` wraps `<RiskIntelligence />`
  - Module 2: `2. DISRUPTION SCENARIO MODELLER` wraps `<ScenarioModeller />`
  - Module 3: `3. ADAPTIVE PROCUREMENT ORCHESTRATOR` wraps `<ProcurementOrchestrator />`
  - Module 4: `4. EXECUTIVE POLICY MEMO AGENT` wraps `<ExecutiveMemo />`

---

### 3. Fallback Telemetry Assets

#### [NEW] [fallback-data.ts](file:///d:/et_ai/lib/fallback-data.ts)
- Define a realistic list of 5 typesafe mock signals `FALLBACK_SIGNALS` matching the store's `Signal` interface.
- Define a baseline `FALLBACK_PRICE = 72.60`.

---

### 4. Client-Side API Caching & Fallback Recovery

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Import `FALLBACK_SIGNALS` and `FALLBACK_PRICE` from `../lib/fallback-data`.
- Update query functions `fetchBrentPrice` and `fetchRiskSignals`:
  - Run the API fetch inside a `try/catch` block.
  - On error, catch the failure, log `console.warn("News API unavailable — using fallback")`, and return fallback structures tagged with an `isFallback: true` flag.
- Define `isFallbackActive` based on query states:
  - `const isFallbackActive = priceData?.isFallback || signalData?.isFallback;`
- Render a visible warning indicator in the header's ambient awareness bar when `isFallbackActive` is true:
  ```tsx
  <span className="text-yellow-500 text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 animate-pulse shrink-0">
    CACHED DATA — LIVE FEED UNAVAILABLE
  </span>
  ```

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify types and Next.js compilation.

### Manual Verification
- Simulate a JS exception in one of the modules and verify that only that component crashes and displays the "Module Fault" reset state, while other panels and navigation rails function correctly.
- Disconnect the network (or point endpoints to dummy values) and verify that the app degrades gracefully, loads cached mock data, and displays the `CACHED DATA — LIVE FEED UNAVAILABLE` badge in the top strip.
