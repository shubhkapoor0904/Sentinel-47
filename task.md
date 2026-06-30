# Task Checklist - Ministerial Response Interventions

- [x] Restructure the Strategic Response Benchmark section of the Executive Memo page into a **75/25 split** in [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx).
- [x] Create the **Response Interventions** panel on the right side (25% width) in [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx).
- [x] Implement the three directive cards (Deploy Navy Escorts, Release SPR Reserves, Bilateral OPEC Negotiation) with Available, Active, and Disabled states.
- [x] Declare active interventions state in [page.tsx](file:///d:/et_ai/app/page.tsx).
- [x] Create the `getAdjustedImpact` helper in [page.tsx](file:///d:/et_ai/app/page.tsx) to modify run rate drops, price shocks, days of cover, and GDP drag when directives are toggled active.
- [x] Implement the `getAdjustedProcurementOptions` helper in [page.tsx](file:///d:/et_ai/app/page.tsx) to dynamically adjust crude source transit times, price premiums, and overall scores when active.
- [x] Hook up automatic memo regeneration via a `useEffect` watching `activeInterventions` in [page.tsx](file:///d:/et_ai/app/page.tsx).
- [x] Reset intervention states automatically when switching scenarios.
- [x] Verify compile check (`npm run build`).
- [x] Create walkthrough.md.
