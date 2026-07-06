# Task Checklist - Upgrade 5: Error Boundaries + Network Fallback

- [x] Create React Error Boundary Component
  - [x] Create [ModuleBoundary.tsx](file:///d:/et_ai/components/ModuleBoundary.tsx)
  - [x] Implement state, fallback UI, error reporting, and reinitialization
- [x] Wrap Navigation Modules in boundaries
  - [x] Update [page.tsx](file:///d:/et_ai/app/page.tsx) to wrap Modules 1-4 with `<ModuleBoundary>`
- [x] Define realistic typesafe Fallback Assets
  - [x] Create [fallback-data.ts](file:///d:/et_ai/lib/fallback-data.ts)
  - [x] Define `FALLBACK_SIGNALS` matching the store's `Signal` interface and `FALLBACK_PRICE`
- [x] Integrate Caching & Fallbacks in TanStack Query fetchers
  - [x] Update `fetchBrentPrice` in [page.tsx](file:///d:/et_ai/app/page.tsx) with catch blocks and `isFallback` flags
  - [x] Update `fetchRiskSignals` in [page.tsx](file:///d:/et_ai/app/page.tsx) with catch blocks, `isFallback` flags, and corridors fallbacks
- [x] Display visual Caching Banner
  - [x] Render `CACHED DATA — LIVE FEED UNAVAILABLE` in the top strip of [page.tsx](file:///d:/et_ai/app/page.tsx) when queries fallback
- [ ] Verification
  - [ ] Run Next.js build (`npm run build`)
  - [ ] Verify error boundaries catch faults and allow reinitialization
  - [ ] Verify fallback triggers correctly when endpoints fail
