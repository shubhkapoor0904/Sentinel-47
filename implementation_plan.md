# Implementation Plan - Upgrade 6: URL State Persistence

This plan implements URL query parameter synchronization for Sentinel-47 using `nuqs`. It allows judges to bookmark or share direct links to specific dashboard tabs and pre-loaded scenarios (e.g. `localhost:3000?module=4&scenario=red_sea_full`).

---

## Proposed Changes

### 1. Project Dependencies

- Install `nuqs` to handle type-safe Next.js URL query parameter synchronization.

---

### 2. Page Suspense Wrapping

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Import `Suspense` from `"react"`.
- Rename the current `Dashboard` component to `DashboardComponent`.
- Create a new default export component `Dashboard` that wraps `<DashboardComponent />` in a `<Suspense>` boundary:
  ```typescript
  export default function Dashboard() {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center font-mono text-xs text-cyber-blue">INITIALIZING SENTINEL SHELL...</div>}>
        <DashboardComponent />
      </Suspense>
    );
  }
  ```
- This Suspense boundary prevents any Next.js static optimization compile errors due to client-side search parameter accesses.

---

### 3. URL State Sync Hooks

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Import `useQueryState` from `"nuqs"`.
- Declare `activeModule` synced to the `"module"` query parameter:
  ```typescript
  const [activeModule, setActiveModule] = useQueryState("module", {
    defaultValue: "1",
    parse: (v) => v,
  });
  ```
- Declare `activeScenarioUrl` synced to the `"scenario"` query parameter:
  ```typescript
  const [activeScenarioUrl, setActiveScenarioUrl] = useQueryState("scenario", {
    defaultValue: "",
    parse: (v) => v,
  });
  ```
- Derivate `activeTab`:
  - Map `activeTab` to use `activeModule` if the guided demo is not running:
    ```typescript
    const activeTab = demoRunning && demoStep > 0 ? demoStep - 1 : parseInt(activeModule ?? "1") - 1;
    ```
- Add a synchronization `useEffect` to write `activeScenarioUrl` into the Zustand store's `activeScenarioId` using `setActiveScenario`.
- Add a synchronization `useEffect` that updates `activeModule` whenever `activeTab` changes. This ensures that the URL dynamically reflects the current view as the tour proceeds or as the user clicks tabs.

---

### 4. Interactive Navigation & Scenario Updates

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- In the vertical navigation rail, call `setActiveModule((idx + 1).toString())` instead of mutating a local state.
- In the `ScenarioModeller` view render block, call `setActiveScenarioUrl(scId)` in `onScenarioChange` so that selecting a scenario immediately updates the browser URL.
- Update initial load simulation: check `activeScenarioUrl` on mount and run the pipeline simulation for the URL-provided scenario (e.g. `red_sea_full`) instead of defaulting to `baseline`.

---

### 5. Copy Demo Link HUD Action

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Add a state `copied` and a handler `handleCopyDemoLink` that writes `window.location.href` to the system clipboard.
- Insert a **COPY DEMO LINK** button in the guided tour narration HUD.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify Next.js build compilation and router routing types compatibility.

### Manual Verification
- Verify that clicking different module tabs updates the URL to `?module=1`, `?module=2`, etc.
- Verify that selecting a scenario in Module 2 updates the URL to `?module=2&scenario=red_sea_full`.
- Click **COPY DEMO LINK** during the tour and verify that pasting it loads the exact active module and scenario states.
- Manually edit the browser search params to `?module=4&scenario=hormuz_50` and verify the platform loads the Strait of Hormuz 50% closure memo directly.
