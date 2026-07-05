# Walkthrough - Sentinel-47 Upgrade Summary

This walkthrough details the implementation of both **Upgrade 1: Zustand Global Store** and **Upgrade 2: Persistent Cryptographic Ledger** across the Sentinel-47 command center dashboard.

---

## 🛠️ Upgrade 1: Zustand Global Store
Centralized dashboard state under a single store structure at [sentinel.ts](file:///d:/et_ai/store/sentinel.ts).

### Core Accomplishments
- **Decoupled Architecture**: Migrated page-level `useState` hooks to the store. Components now fetch and mutate state via direct store hooks, preventing prop drilling.
- **Computed Resilience Index**: Bound the national resilience score dynamically via Zustand's `subscribeWithSelector`. It computes real-time resilience on any changes to risk telemetry or active scenario disruptions.
- **Tour Desynchronization Bug Fix**: Aligned all tour captions, timers, and active tabs with the single store value `demoStep` (0 to 4). Clicking navigation tabs automatically snaps `demoTime` and captions to the exact step marker, preventing UI desyncs.

---

## 🔐 Upgrade 2: Persistent Cryptographic Ledger
Closed the credibility gap by implementing a verifiable blockchain-inspired decision log persisted locally.

### Technical Implementation

#### 1. Verifiable Chain Structure
- snapshotted live corridor threat levels, timestamps, scenarios, and memo descriptions within the `LedgerEntry` schema:
  ```typescript
  export interface LedgerEntry {
    id: string;               // crypto.randomUUID()
    sequence: number;         // monotonically incrementing
    timestamp: string;        // IST timezone ISO string
    scenarioId: string;
    corridorScores: {         // snapshot of live state
      hormuz: number;
      redSea: number;
      suez: number;
    };
    memoSubject: string;
    contentHash: string;      // SHA-256 of full memo text + timestamp
    previousHash: string;     // contentHash of the predecessor
  }
  ```

#### 2. SHA-256 Logging Action
- Reconfigured `appendLedgerEntry` inside [sentinel.ts](file:///d:/et_ai/store/sentinel.ts) to calculate SHA-256 content hashes asynchronously using browser `crypto.subtle.digest`:
  ```typescript
  const encoder = new TextEncoder();
  const data = encoder.encode(memoFullText + timestamp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contentHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  ```
- Implemented `previousHash` linkage:
  - If the ledger is empty, `previousHash = "GENESIS"`.
  - Otherwise, it is set to the preceding entry's `contentHash`.
- **IST ISO 8601 Timestamps**: Computed local IST timestamps natively by shifting date milliseconds by `+5:30` during formatting.
- **Persistence**: Hooked the action to immediately write the entire array to `localStorage` under the key `"sentinel47_ledger"` so blocks survive browser reloads.

#### 3. Execution Pipeline Wiring
- Configured [page.tsx](file:///d:/et_ai/app/page.tsx) to capture generated briefs and feed raw text to `appendLedgerEntry` once briefs are synthesized:
  ```typescript
  const compiledMemo = await compileDecisionMemo(...);
  if (compiledMemo) {
    const fullMemoText = [compiledMemo.memoId, compiledMemo.subject, compiledMemo.executiveSummary, ...].join("\n");
    await appendLedgerEntry(scId, compiledMemo.subject, fullMemoText);
  }
  ```

#### 4. Collapsible Auditing Panel UI
- Rendered a collapsible **DECISION BRIEF AUDITING CHAIN (LEDGER)** panel at the bottom of the Executive Brief in [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx).
- Features a monospace table showing `# | TIMESTAMP (IST) | SCENARIO ID | MEMO SUBJECT | HASH`.
- Clicking any row expands details to display the full SHA-256 content hash, parent hash, and snapshot scores.
- Includes a **VERIFY CHAIN** button that validates the block sequence and shows a status indicator:
  - Green success banner: `"CHAIN INTACT — N entries verified successfully."`
  - Red alert: `"CHAIN BROKEN — Discrepancy detected at Entry #i"` if a hash mismatch is found.
- Labeled clearly: `"BROWSER-PERSISTED LEDGER — production deployment would use append-only database (Supabase/PostgreSQL)"`.

---

## 🧪 Verification Plan

### 1. Verification Compilation Build
Please compile the build to verify all Types:
```bash
npm run build
```

### 2. Manual Verification Walkthrough
1. Go to the dashboard and trigger a disruption (e.g. Strait of Hormuz 50% Closure).
2. Navigate to **Executive Brief** and notice that a ledger log entry is visible in the bottom popover.
3. Click the table row to expand the raw `contentHash` and `previousHash` (should read `"GENESIS"` on first block).
4. Simulate another disruption (e.g., OPEC+ Supply Cut). Notice entry #2 is logged. Expand it and verify that `previousHash` matches entry #1's `contentHash`.
5. Press **VERIFY CHAIN** to see the green success banner.
6. Refresh the browser tab and verify that both auditing logs remain hydrated.
