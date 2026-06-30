# Implementation Plan - Final UI Polish Pass

We will implement the refinements outlined in prompt.txt:
1. Improve density of the Quarterly GDP Drag card by adding an SVG timeline/sparkline.
2. Enhance the SPR chambers to look like tall storage tanks with wavy, shimmering oil levels and staggered capacities.
3. Pulse the Ripple Effect graph connections and highlight active path weights.

---

## Proposed Changes

### [Component: Core State and Orchestration]

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- **Synchronized 4-Metric Tweening**: Expand the `useEffect` animation loop to animate all four impact metrics simultaneously over the **10-second** period:
  - `animatedRefinery` (run-rate drop)
  - `animatedPrice` (fuel price delta)
  - `animatedGdp` (GDP drag)
  - `animatedDaysOfCover` (SPR cover)
- **Pass Animated Props**: Update props sent to `ScenarioModeller` and `ExecutiveMemo` to include all animated metrics.

---

### [Component: Scenario Modeller]

#### [MODIFY] [ScenarioModeller.tsx](file:///d:/et_ai/components/ScenarioModeller.tsx)
- **Props signature**: Update `ScenarioModellerProps` to accept `animatedRefinery`, `animatedPrice`, and `animatedGdp`.
- **GDP Sparkline**: Draw a small inline SVG sparkline (`0 0 200 50`) inside the GDP card showing milestones (Today $\rightarrow$ Wk 1 $\rightarrow$ Wk 2 $\rightarrow$ Qtr End) that bends downward proportionally to the animated GDP drag.
- **SPR Chambers Refinement**:
  - Increase storage cylinder height to `h-24` and width to `w-9`.
  - Style them as vertical rectangular-cylindrical storage canisters (`rounded-t-md rounded-b`).
  - Overlay an SVG flowing sine-wave cap inside the canisters that flows continuously via CSS keyframes.
  - Stagger baseline fill percentages: Padur (98%), Mangalore (94%), Visakhapatnam (88%), and drain proportionally from these baselines to represent unique chamber reserves.
- **Ripple Effect Upgrades**:
  - Add `<animateMotion>` circles that flow along the Bezier connections representing energy shock propagation.
  - Scale path `strokeWidth` and `opacity` dynamically based on pathway severity (stable vs warning vs critical).
  - Add inline drop-shadow glows (`drop-shadow`) to active propagation paths.
  - Inject CSS global keyframes for the wave flow and animated pulses inside a `<style jsx global>` tag.

---

### [Component: Executive Memo]

#### [MODIFY] [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx)
- Use `sprDays` to display the warning banner in perfect timing sync with the animated reserves.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify compiling safety.

### Manual Verification
1. Trigger a disruption preset (e.g. Hormuz 50%).
2. Verify that:
   - Refinery, Price, GDP, and SPR metrics all animate in unison over 10 seconds.
   - The SPR tanks drain smoothly with wavy oil surfaces and slightly staggered percentages (e.g. 98%, 94%, 88% down to target levels).
   - The GDP card displays the glowing sparkline curving downward dynamically.
   - The Ripple Effect graph shows glowing thick lines with small glowing pulses flowing along the paths.
