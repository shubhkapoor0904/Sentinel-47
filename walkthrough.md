# Walkthrough - Sentinel-47 Upgrade Summary

This walkthrough details the implementation of **Upgrade 1: Zustand Global Store**, **Upgrade 2: Persistent Cryptographic Ledger**, **Upgrade 4: TanStack Query for API Layer**, **Upgrade 5: Error Boundaries + Network Fallback**, and **Upgrade 6: URL State Persistence** across the Sentinel-47 command center dashboard.

---

## 🛠️ Upgrade 1: Zustand Global Store
Centralized dashboard state under a single store structure at [sentinel.ts](file:///d:/et_ai/store/sentinel.ts).

### Core Achievements
- **Decoupled Architecture**: Migrated page-level `useState` hooks to the store. Components now fetch and mutate state via direct store hooks, preventing prop drilling.
- **Computed Resilience Index**: Bound the national resilience score dynamically via Zustand's `subscribeWithSelector`. It computes real-time resilience on any changes to risk telemetry or active scenario disruptions.
- **Tour Desynchronization Bug Fix**: Aligned all tour captions, timers, and active tabs with the single store value `demoStep` (0 to 4). Clicking navigation tabs automatically snaps `demoTime` and captions to the exact step marker, preventing UI desyncs.

---

## 🔐 Upgrade 2: Persistent Cryptographic Ledger
Closed the credibility gap by implementing a verifiable blockchain-inspired decision log persisted locally.

### Core Achievements
- **Verifiable Chain Structure**: Snapshotted live corridor threat levels, timestamps, scenarios, and memo descriptions within the `LedgerEntry` schema.
- **SHA-256 Logging Action**: Calculated SHA-256 content hashes asynchronously using browser `crypto.subtle.digest` and linked them in a sequence with `"GENESIS"` and predecessor hashes, persisted in `localStorage`.
- **Collapsible Auditing Panel UI**: Created a collapsible **DECISION LEDGER** panel at the bottom of the Executive Brief in [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx) with a **VERIFY CHAIN** validator checking validity.

---

## ⚡ Upgrade 4: TanStack Query for API Layer
Upgraded the data-fetching layer to use production-grade state management, caching, background refetching, and auto-recovery.

### Core Achievements
1. **Client-Side Query Provider**
   - Created [Providers.tsx](file:///d:/et_ai/components/Providers.tsx) client wrapper to instantiate the `QueryClient`.
   - Set queries' staleTime to 55s (`staleTime: 55_000`), refetchInterval to 60s (`refetchInterval: 60_000`), and configured it to retry failed fetches twice (`retry: 2`) with a 3s delay (`retryDelay: 3000`).
   - Integrated `<Providers>` in [layout.tsx](file:///d:/et_ai/app/layout.tsx) without breaking Layout SSR metadata exports.

2. **Refactored Dashboard Data Pipeline**
   - Refactored [page.tsx](file:///d:/et_ai/app/page.tsx) to query the `/api/risk` endpoint using dual `useQuery` blocks: `["brent-price"]` and `["risk-signals"]`.
   - **Demo Protection**: Configured queries to disable background fetching and auto-updates while the **GUIDED DEMO** is running (`refetchInterval: demoRunning ? false : 60_000`). This ensures active tours are not overwritten by background API syncs.
   - **Automatic Store Synchronization**: Set up `useEffect` synchronization blocks that feed fresh query data into the Zustand store when the demo is not running.
   - **Initial Load Optimization**: Replaced the custom `fetchRiskIntelligence` initial load loop with a robust effect that triggers baseline scenario modeling and memo generation immediately after queries finish loading.

3. **Dynamic "Last Updated" Countdown Indicator**
   - Wired `dataUpdatedAt` from the risk signals query to `<RiskIntelligence>` in [RiskIntelligence.tsx](file:///d:/et_ai/components/RiskIntelligence.tsx).
   - Added a client-side timer updating once per second to compute `secondsAgo`.
   - Replaced the hardcoded polling label with the live-updating `UPDATED {secondsAgo}s AGO` banner.

---

## 🛡️ Upgrade 5: Error Boundaries + Network Fallback
Implemented a robust local safety net separating individual component failures and providing resilient fallback data recovery.

### Core Achievements
1. **Client-Side Error Boundaries (`ModuleBoundary`)**
   - Created the [ModuleBoundary.tsx](file:///d:/et_ai/components/ModuleBoundary.tsx) class component to catch JS runtime errors within views.
   - Designed a cyber-themed "Module Fault" fallback layout reporting the exact error message alongside an isolation warning statement.
   - Provided a **REINITIALIZE MODULE** action button to clear error state.
   - Wrapped each of the 4 vertical module tabs in `page.tsx` with `<ModuleBoundary moduleName="...">`, protecting the app from full screen crashes if a single panel faults.

2. **API Caching & Network Fallback**
   - Created [fallback-data.ts](file:///d:/et_ai/lib/fallback-data.ts) with 5 realistic typesafe fallback signals (`FALLBACK_SIGNALS`) and a fallback price (`FALLBACK_PRICE = 72.60`).
   - Wrapped queries in `try/catch` fetch blocks inside `page.tsx`. If an endpoint is offline, queries catch the warning, log a warning in the console, and return fallback data with an `isFallback: true` flag.

3. **Live Telemetry Banner**
   - Added a `CACHED DATA — LIVE FEED UNAVAILABLE` warning badge in the header of `page.tsx` next to the `SYSTEM STATE` indicator when `isFallbackActive` is true.

---

## 🔗 Upgrade 6: URL State Persistence
Enabled type-safe browser search parameters mapping to the active module and disruption scenarios, enabling bookmarking and direct share links.

### Core Achievements
1. **App Router Suspense Wrapper**
   - Wrapped the entire Client Dashboard page in a `<Suspense>` component boundary. This guarantees that Next.js static prerender routines successfully compile search parameters access without throwing exceptions.
2. **Type-Safe Sync Hooks (`nuqs`)**
   - Integrated `useQueryState("module")` and `useQueryState("scenario")` to store tab views and active scenario IDs inside URL search parameters.
   - Map `activeTab` to derive from `activeModule` when not running a guided tour.
3. **Bilateral State Syncing**
   - Synchronized query parameter changes in the URL directly with Zustand store parameters, enabling direct deep links (e.g. `?module=4&scenario=red_sea_full`) to pre-trigger specific scenario analysis pipelines on mount.
   - Sync store parameters (like navigation changes during the demo tour) back to URL query parameters so the URL continuously matches active states.
4. **Copy Demo Link Action**
   - Added a clipboard copy utility `handleCopyDemoLink` that stores the exact browser URL state.
   - Rendered a **COPY DEMO LINK** action button inside the Tour Narration Overlay HUD.

---

## 🧪 Verification & Execution Steps

As the agent environment policy restricts running local package installs or build steps directly, please execute the following verification steps on your terminal:

### 1. Install Dependencies
Run the command below in the workspace root directory:
```bash
npm install nuqs
```

### 2. Verify and Build the App
Validate types and compile the Next.js bundle to confirm everything compiles successfully:
```bash
npm run build
```

### 3. Run Locally
Start the development server:
```bash
npm run dev
```

### 4. Verify URL State Syncing
1. Open the application. Note that the URL updates automatically to `?module=1`.
2. Click on different vertical navigation rail icons (e.g. tab 3). Verify that the URL updates in real-time to `?module=3`.
3. Navigate to **Module 2 (Disruption Scenario)** and select **Red Sea Full Transit Suspension**. Verify that the URL updates to `?module=2&scenario=red_sea_full`.
4. Copy the URL, close the tab, open a new browser tab, paste the link, and verify it navigates directly to Module 2 with the Red Sea Full Transit Suspension scenario pre-loaded!
5. Start the **GUIDED TOUR**. Verify that the URL updates dynamically as the steps progress (e.g. `?module=1` -> `?module=2` -> `?module=3` -> `?module=4`).
6. Click **COPY DEMO LINK** during the tour and verify that pasting the link in a new tab initializes the app at the exact module and scenario state.
