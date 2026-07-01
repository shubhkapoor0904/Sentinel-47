# Implementation Plan - Live Scenario Probability Weighting

This plan introduces live risk-weighted scenario probabilities to the preset panel in Module 2, normalized dynamically from Module 1 threat corridor telemetry, alongside a new "WEIGHTED COMPOSITE" scenario blending active risk assessments.

---

## User Review Required

> [!IMPORTANT]
> **Corridor Probability Mapping**:
> - `Hormuz 50% Closure` maps to the Strait of Hormuz (`Hormuz`) corridor risk score.
> - `Red Sea Suspension` maps to the Red Sea (`Red Sea`) corridor risk score.
> - `OPEC+ Emergency Cut` maps to the Suez Canal (`Suez`) corridor risk score.
> 
> **Weight Normalization Guard**:
> - Weights are computed dynamically: $P_{i} = \text{round}\left(\frac{\text{score}_i}{\sum \text{score}} \times 100\right)\%$.
> - We adjust the final weight so they always sum to exactly $100\%$.
> - If live telemetry is unavailable, it falls back to equal weights ($33\%$, $33\%$, $34\%$) labeled `[EST.]`.

---

## Proposed Changes

### [Component Name]

#### [MODIFY] [ScenarioModeller.tsx](file:///d:/et_ai/components/ScenarioModeller.tsx)
- Add rendering logic for the **Probability Weight Badges** beside each active preset scenario (Hormuz, OPEC+, Red Sea).
- Display a tiny percentage indicator and a mini horizontal loading-bar (3-4px high) under each active preset card.
- Exclude `Replay: 2025` (`[HISTORICAL]`) and `Custom` (`[MANUAL]`) from weights.
- Add the **"WEIGHTED COMPOSITE"** scenario selection block at the bottom of the preset list with:
  - Gold/amber left border (`border-l-amber-500` or custom gold glow).
  - Small `LIVE` badge indicator.
  - Subtext/description: *"Expected-value blend of all 3 active scenarios weighted by current corridor risk"*.
  - Underneath, display the data honesty disclaimer caption: *"Composite weighted by live Module 1 corridor scores — not a forecast, an expected-value operational estimate."*
- Ensure the point estimates inside the scenario cards continue to be displayed with the $\pm 15\%$ range bounds.

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Calculate normalized probability weights dynamically using active corridor telemetry state:
  ```typescript
  const weights = useMemo(() => {
    const rHormuz = corridors["Hormuz"]?.score;
    const rRedSea = corridors["Red Sea"]?.score;
    const rSuez = corridors["Suez"]?.score;
    
    if (rHormuz === undefined || rRedSea === undefined || rSuez === undefined) {
      return { hormuz: 33, redSea: 33, opec: 34, isFallback: true };
    }
    
    const total = rHormuz + rRedSea + rSuez;
    if (total === 0) {
      return { hormuz: 33, redSea: 33, opec: 34, isFallback: true };
    }
    
    const wHormuz = Math.round((rHormuz / total) * 100);
    const wRedSea = Math.round((rRedSea / total) * 100);
    const wOpec = 100 - wHormuz - wRedSea;
    return { hormuz: wHormuz, redSea: wRedSea, opec: wOpec, isFallback: false };
  }, [corridors]);
  ```
- Define composite scenario simulation logic. When the `WEIGHTED COMPOSITE` preset is selected:
  - Calculate `impact` metrics (refinery run-rate drop, fuel price delta, days of cover, GDP drag) as the weighted sum of the 3 presets:
    - $\text{value}_{\text{composite}} = \frac{w_1 \cdot \text{value}_1 + w_2 \cdot \text{value}_2 + w_3 \cdot \text{value}_3}{100}$
  - Update states so they animate cleanly over 10 seconds.
  - Automatically update `activeInterventions` and run memo compilation based on the blended estimates.

---

## Verification Plan

### Manual Verification
1. Open the dashboard.
2. Verify that each preset card (Hormuz, OPEC+, Red Sea) displays the correct probability weight badge and matching mini horizontal bar.
3. Refresh Module 1 data and verify weights dynamically update.
4. Click **WEIGHTED COMPOSITE** and verify all telemetry counters, caverns, ripple graphs, and procurement options blend and animate correctly.
