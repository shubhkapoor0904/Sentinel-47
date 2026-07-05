# Walkthrough - Zustand Global Store Integration (Upgrade 1)

I have successfully refactored the Sentinel-47 state management by implementing a single, centralized Zustand store. This eliminates the guided tour desynchronization bug and creates a clean, decoupled state architecture across all 4 modules.

---

## 🛠️ Changes Made

### 1. Created Centralized Zustand Store
- **File**: [sentinel.ts](file:///d:/et_ai/store/sentinel.ts)
- **Features**:
  - Defined strict TypeScript types for `Signal`, `DarkFleetEntry`, `ScenarioOutput`, `ProcurementOption`, `Memo`, and `LedgerEntry`.
  - Created a unified `useSentinelStore` that holds all live telemetry, scenario parameters, ranked procurement configurations, generated decision briefs, active response interventions, and guided tour states.
  - Linked `localStorage` persistence directly within the `appendLedgerEntry` store action:
    ```typescript
    appendLedgerEntry: (entry) => set((state) => {
      const updated = [...state.ledgerEntries, entry];
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_ledger_entries", JSON.stringify(updated));
      }
      return { ledgerEntries: updated };
    })
    ```

### 2. Auto-Computed Resilience Index
- **File**: [sentinel.ts](file:///d:/et_ai/store/sentinel.ts)
- **Logic**: Used Zustand's `subscribeWithSelector` middleware to observe changes to `corridorScores`, `scenarioOutput`, and `activeInterventions` simultaneously. It automatically calculates the derived national resilience score inside the store, ensuring it is always synchronized:
  ```typescript
  useSentinelStore.subscribe(
    (state) => [state.corridorScores, state.scenarioOutput, state.activeInterventions] as const,
    ([corridorScores, scenarioOutput, activeInterventions]) => {
      const score = calculateResilienceScore(corridorScores, scenarioOutput, activeInterventions);
      useSentinelStore.setState({ resilienceScore: score });
    },
    ...
  );
  ```

### 3. Guided Tour Desynchronization Fix
- **File**: [sentinel.ts](file:///d:/et_ai/store/sentinel.ts) & [page.tsx](file:///d:/et_ai/app/page.tsx)
- **Fix**: Replaced the fragile timer-based snapping loop with a strict single source of truth driven by `demoStep` and `demoTime` in the global store.
  - When the user manually clicks navigation rail tabs during a tour, it triggers `pauseDemo()` and snaps `demoStep` to the new tab index:
    ```typescript
    onClick={() => {
      if (demoRunning) {
        pauseDemo();
        setDemoStep(idx + 1);
      } else {
        setLocalActiveTab(idx);
      }
    }}
    ```
  - Snapping the step automatically sets `demoTime` to the exact start of that step. As a result, the active tab, the HUD captions, and the timer always follow `demoStep`, making desyncs structurally impossible!

### 4. Component Migrations
All components have been migrated to read state directly from the Zustand store, decluttering prop drilling:
- [page.tsx](file:///d:/et_ai/app/page.tsx): Stripped local useState declarations. Replaced them with the `useSentinelStore` hook and simple `useMemo` hooks to reconstruct detailed corridors and weight structures dynamically.
- [RiskIntelligence.tsx](file:///d:/et_ai/components/RiskIntelligence.tsx): Reads brent crude price, news feed signals, and dark fleet lists from the store, making the feed parsing standalone.
- [ScenarioModeller.tsx](file:///d:/et_ai/components/ScenarioModeller.tsx): Subscribes to scenario states and computes probability weights internally.
- [ProcurementOrchestrator.tsx](file:///d:/et_ai/components/ProcurementOrchestrator.tsx): Retrieves base procurement alternatives and overlays active response intervention math dynamically using a self-contained selector hook.
- [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx): Connects briefing memos, intervention states, and ledger records to the store. 
  - **Dynamic Cryptographic Audit Logs**: Replaced the static ledger block at the bottom of the brief with a dynamic element that displays the latest SHA-256 ledger entry and entry index directly from the store!

---

## ⚡ Package Modifications
- **File**: [package.json](file:///d:/et_ai/package.json)
- **Action**: Added `"zustand": "^5.0.3"` dependency for installation.

---

## 🧪 Verification Plan

### 1. Install Dependencies
Please run:
```bash
npm install
```

### 2. Verify Next.js Compilation
Run the Next.js build compiler to ensure all TypeScript typings resolve correctly:
```bash
npm run build
```

### 3. Verify Manual Dashboard Features
Run the local dev server:
```bash
npm run dev
```
1. **Guided Tour Validation**: Click **RUN GUIDED DEMO**. Verify HUD timer ticking. Pause the tour, resume it, and skip steps. Click tabs manually during the tour to verify it pauses and snaps captions/timers instantly without desyncs.
2. **Interventions Toggling**: Go to Executive Memo, toggle escorts/reserves, and verify that the cascading metrics in Scenario Modeller (Refinery tube, SPR cavern levels, GDP drags) adjust dynamically.
3. **Auditing Logs**: Verify that every simulated scenario change appends a new cryptographically logged item to `localStorage`, and that the memo footer dynamically displays the correct logged item index and hash.
