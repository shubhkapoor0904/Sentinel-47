# Task Checklist - Upgrade 1: Zustand Global Store

- [x] Initialize Zustand store setup
  - [x] Install `zustand` npm package (added to dependencies in package.json)
  - [x] Create store file at [sentinel.ts](file:///d:/et_ai/store/sentinel.ts)
- [x] Migrate Main Page logic
  - [x] Replace local state declarations in [page.tsx](file:///d:/et_ai/app/page.tsx) with store selectors
  - [x] Integrate store actions for fetching, simulating, and brief compiling
  - [x] Rewrite guided demo interval loop and event triggers in [page.tsx](file:///d:/et_ai/app/page.tsx) to rely on store `demoStep` and `demoTime`
- [x] Migrate Components
  - [x] Refactor [RiskIntelligence.tsx](file:///d:/et_ai/components/RiskIntelligence.tsx) to consume state from store
  - [x] Refactor [ScenarioModeller.tsx](file:///d:/et_ai/components/ScenarioModeller.tsx) to consume state from store
  - [x] Refactor [ProcurementOrchestrator.tsx](file:///d:/et_ai/components/ProcurementOrchestrator.tsx) to consume state from store
  - [x] Refactor [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx) to consume state from store
- [/] Verification
  - [ ] Run `npm run build` to verify Next.js build compilation (needs user run due to system tool access denial)
  - [ ] Verify all guided tour transitions, intervention switches, and local storage ledger entries manually
