# Implementation Plan - Upgrade 2: Persistent Cryptographic Ledger

This plan implements a persistent, verifiable cryptographic audit log of decision briefs generated within the Sentinel-47 command center. It bridges the credibility gap by persisting calculations across refreshes and enabling real-time integrity verification.

---

## Proposed Changes

### 1. Store Definition & Persistence

#### [MODIFY] [sentinel.ts](file:///d:/et_ai/store/sentinel.ts)
- Update `LedgerEntry` type structure to:
  ```typescript
  export interface LedgerEntry {
    id: string;               // crypto.randomUUID()
    sequence: number;         // monotonically incrementing
    timestamp: string;        // ISO 8601 / IST timezone
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
- Change `appendLedgerEntry` to an async store action:
  ```typescript
  appendLedgerEntry: (scenarioId: string, memoSubject: string, memoFullText: string) => Promise<void>;
  ```
- Update store initialization:
  - Read from `localStorage` under the key `"sentinel47_ledger"`.
  - Hydrate `ledgerEntries` list on initialization.
- Implement SHA-256 computation inside the action using browser `crypto.subtle.digest`:
  ```typescript
  const encoder = new TextEncoder();
  const data = encoder.encode(memoFullText + timestamp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  ```

---

### 2. Sourcing Brief Execution Pipeline

#### [MODIFY] [page.tsx](file:///d:/et_ai/app/page.tsx)
- Update the pipeline execution `triggerFullPipeline` to collect generated memo data and call `appendLedgerEntry` on success.
- Extract `subject` and complete text content from the memo to feed the encoder.

---

### 3. Ledger Auditing UI Panel

#### [MODIFY] [ExecutiveMemo.tsx](file:///d:/et_ai/components/ExecutiveMemo.tsx)
- Create a new collapsible **DECISION LEDGER** panel at the bottom of the Executive Brief, beneath the printable document container.
- Implement a monospace entries table containing:
  - Sequence index (`#`)
  - Timestamp (IST format)
  - Scenario ID
  - Abbreviated Hash (first 12 characters)
- Add expandable row details displaying:
  - Full `contentHash`
  - Full `previousHash`
  - Snapped corridor scores snapshot
- Add a **VERIFY CHAIN** button that loops through all entries:
  - Confirms first entry's `previousHash === "GENESIS"`.
  - Checks if `entry.previousHash === entries[i - 1].contentHash` for all subsequent entries.
  - Displays chain verification state inside a cybernetic indicator banner: `"CHAIN INTACT — N entries verified"` or `"CHAIN BROKEN at Sequence #i"`.
- Label the panel clearly with the senior engineering notice:
  - `"BROWSER-PERSISTED LEDGER — production deployment would use append-only database (Supabase/PostgreSQL)"`.

---

## Verification Plan

### Automated Tests
- Build verification using:
  ```bash
  npm run build
  ```

### Manual Verification
- Generate a disruption scenario briefing (e.g., Red Sea Full Transit Suspension) and verify that a new ledger item is appended.
- Reload the browser page and verify that the items in the **DECISION LEDGER** table remain populated.
- Press **VERIFY CHAIN** and verify that a green success badge appears.
- Modify local storage manually (or simulate tampering) to check if the verification chain correctly flags broken hashes.
