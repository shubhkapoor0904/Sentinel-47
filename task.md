# Task Checklist - Ministerial Response Interventions

- [x] Restructure the Strategic Response Benchmark section of the Executive Memo page into a **75/25 split** in [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx).
- [x] Create the **Response Interventions** panel on the right side (25% width) in [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx).
- [x] Implement the three directive cards (Deploy Navy Escorts, Release SPR Reserves, Bilateral OPEC Negotiation) with Available, Active, and Disabled states.
- [x] Declare active interventions state in [page.tsx](file:///d:/et_ai/app/page.tsx).
- [x] Create the `getAdjustedImpact` helper in [page.tsx](file:///d:/et_ai/app/page.tsx) to modify run rate drops, price shocks, days of cover, and GDP drag when directives are toggled active.
- [x] Implement the `getAdjustedProcurementOptions` helper in [page.tsx](file:///d:/et_ai/app/page.tsx) to dynamically adjust crude source transit times, price premiums, and overall scores when active.
- [x] Hook up automatic memo regeneration via a `useEffect` watching `activeInterventions` in [page.tsx](file:///d:/et_ai/app/page.tsx).
- [x] Reset intervention states automatically when switching scenarios.
- [x] Memoize `adjustedImpact` and `adjustedProcurementOptions` using React `useMemo` hooks to optimize performance and prevent render loop references.
- [x] Integrate matching guard optimization inside animation `useEffect` to abort animation loop scheduling when targets match current values.
- [x] Fix the blank PDF print issue by resetting print display flows on view containers and replacing the invalid className selector inside [globals.css](file:///d:/et_ai/app/globals.css) with a standard utility selector.
- [x] Add cryptographic ledger entry hash at the very bottom of the executive memo.
- [x] Tighten document spacing by inserting an dashed 'END OF BRIEF' divider line and reducing the margins on the signature block and auditing ledger entry.
- [x] Fix the Security & Speed Agent logic in [ProcurementOrchestrator.tsx](file:///d:/et_ai/components/ProcurementOrchestrator.tsx) so each crude candidate is evaluated independently on its own terms rather than repeating the same SPR conclusion.
- [x] Verify compile check (`npm run build`).
- [x] Create walkthrough.md.
