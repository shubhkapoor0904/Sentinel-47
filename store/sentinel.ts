import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Signal {
  id: string;
  corridor: "Hormuz" | "Red Sea" | "Suez" | "Global";
  event_type: string;
  severity_0to10: number;
  confidence: number;
  source: string;
  timestamp: string;
  reasoning: string;
  headline: string;
}

export interface DarkFleetEntry {
  id: string;
  type: string;
  lastKnown: string;
  lostTime: string;
  assessment: string;
}

export interface ScenarioOutput {
  refinery_run_rate_drop: number;
  fuel_price_delta: number;
  days_of_cover: number;
  gdp_drag: number;
  assumptions: string[];
}

export interface ProcurementOption {
  name: string;
  source: string;
  pricePremium: number;
  transitDays: number;
  portCongestion: "Low" | "Medium" | "High";
  compatibility: number;
  overallScore: number;
  reasoning: string;
}

export interface Memo {
  memoId: string;
  date: string;
  to: string;
  from: string;
  subject: string;
  executiveSummary: string;
  riskAssessment: string[];
  impactFindings: string[];
  procurementDirectives: string[];
  sprDirectives: string;
  signature: string;
  timeSavedStatement: string;
  autoTriggerStatement?: string;
}

export interface LedgerEntry {
  id: string;
  hash: string;
  timestamp: string;
  scenarioId: string;
  details: string;
}

export interface SentinelStore {
  // Module 1 live state
  brentPrice: number;
  brentSource: string;
  corridorScores: {
    hormuz: number;
    redSea: number;
    suez: number;
  };
  signals: Signal[];
  darkFleetEvents: DarkFleetEntry[];
  lastFetchedAt: Date | null;

  // Module 2 scenario state
  activeScenarioId: string | null;
  scenarioOutput: ScenarioOutput | null;
  customCapacityLoss: number;

  // Module 3 procurement state
  rankedOptions: ProcurementOption[];

  // Module 4 memo state
  currentMemo: Memo | null;
  ledgerEntries: LedgerEntry[];
  activeInterventions: {
    navyEscorts: boolean;
    sprRelease: boolean;
    opecNegotiation: boolean;
  };

  // Resilience Index (derived, auto-computed)
  resilienceScore: number;

  // Guided demo state
  demoRunning: boolean;
  demoPaused: boolean;
  demoStep: number; // 0 = not started, 1-4 = active step
  demoStepStartedAt: Date | null;
  demoTime: number;

  // Setters & Actions
  setBrentPrice: (price: number) => void;
  setBrentSource: (source: string) => void;
  setCorridorScores: (scores: { hormuz: number; redSea: number; suez: number }) => void;
  setSignals: (signals: Signal[]) => void;
  setDarkFleetEvents: (events: DarkFleetEntry[]) => void;
  setLastFetchedAt: (date: Date | null) => void;

  setActiveScenario: (id: string | null) => void;
  setScenarioOutput: (output: ScenarioOutput | null) => void;
  setCustomCapacityLoss: (loss: number) => void;

  setRankedOptions: (options: ProcurementOption[]) => void;

  setCurrentMemo: (memo: Memo | null) => void;
  appendLedgerEntry: (entry: LedgerEntry) => void;
  toggleIntervention: (id: "navyEscorts" | "sprRelease" | "opecNegotiation") => void;
  setInterventions: (interventions: { navyEscorts: boolean; sprRelease: boolean; opecNegotiation: boolean }) => void;
  resetInterventions: () => void;

  setDemoStep: (step: number) => void;
  setDemoTime: (time: number) => void;
  incrementDemoTime: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  stopDemo: () => void;
  startDemo: () => void;
}

// Helper to calculate derived resilience score
const calculateResilienceScore = (
  corridorScores: { hormuz: number; redSea: number; suez: number },
  scenarioOutput: ScenarioOutput | null,
  activeInterventions: { navyEscorts: boolean; sprRelease: boolean; opecNegotiation: boolean }
) => {
  const avgCorridorRisk = (corridorScores.hormuz + corridorScores.redSea + corridorScores.suez) / 3;
  const corridorResilience = 100 - avgCorridorRisk;

  // Derive adjusted values from scenarioOutput and interventions
  let refineryDrop = scenarioOutput?.refinery_run_rate_drop ?? 0;
  let sprDays = scenarioOutput?.days_of_cover ?? 9.5;
  let gdpDragVal = scenarioOutput?.gdp_drag ?? 0;

  if (activeInterventions.navyEscorts) {
    refineryDrop = Math.max(0, refineryDrop - 5);
    gdpDragVal = Math.max(0, gdpDragVal - 0.12);
  }
  if (activeInterventions.sprRelease) {
    refineryDrop = Math.max(0, refineryDrop - 10);
    gdpDragVal = Math.max(0, gdpDragVal - 0.22);
    sprDays = Math.min(9.5, sprDays + 1.5);
  }
  if (activeInterventions.opecNegotiation) {
    refineryDrop = Math.max(0, refineryDrop - 3);
    gdpDragVal = Math.max(0, gdpDragVal - 0.10);
  }

  const sprResilience = (sprDays / 9.5) * 100;
  const refineryResilience = 100 - refineryDrop;
  const gdpResilience = Math.max(0, 100 - (gdpDragVal / 1.5) * 100);

  return Math.round(
    (corridorResilience * 0.30) +
    (sprResilience * 0.30) +
    (refineryResilience * 0.25) +
    (gdpResilience * 0.15)
  );
};

export const useSentinelStore = create(
  subscribeWithSelector<SentinelStore>((set) => ({
    brentPrice: 74.50,
    brentSource: "Estimated",
    corridorScores: { hormuz: 15, redSea: 15, suez: 15 },
    signals: [],
    darkFleetEvents: [],
    lastFetchedAt: null,
    activeScenarioId: "baseline",
    scenarioOutput: null,
    customCapacityLoss: 0,
    rankedOptions: [],
    currentMemo: null,
    ledgerEntries: typeof window !== "undefined" ? (() => {
      const stored = localStorage.getItem("sentinel_ledger_entries");
      return stored ? JSON.parse(stored) : [];
    })() : [],
    activeInterventions: { navyEscorts: false, sprRelease: false, opecNegotiation: false },
    resilienceScore: 100,
    demoRunning: false,
    demoPaused: false,
    demoStep: 0,
    demoStepStartedAt: null,
    demoTime: 0,

    setBrentPrice: (price) => set({ brentPrice: price }),
    setBrentSource: (source) => set({ brentSource: source }),
    setCorridorScores: (scores) => set({ corridorScores: scores }),
    setSignals: (signals) => set({ signals }),
    setDarkFleetEvents: (events) => set({ darkFleetEvents: events }),
    setLastFetchedAt: (date) => set({ lastFetchedAt: date }),

    setActiveScenario: (id) => set({ activeScenarioId: id }),
    setScenarioOutput: (output) => set({ scenarioOutput: output }),
    setCustomCapacityLoss: (loss) => set({ customCapacityLoss: loss }),

    setRankedOptions: (options) => set({ rankedOptions: options }),

    setCurrentMemo: (memo) => set({ currentMemo: memo }),
    appendLedgerEntry: (entry) => set((state) => {
      const updated = [...state.ledgerEntries, entry];
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_ledger_entries", JSON.stringify(updated));
      }
      return { ledgerEntries: updated };
    }),
    toggleIntervention: (id) => set((state) => ({
      activeInterventions: {
        ...state.activeInterventions,
        [id]: !state.activeInterventions[id]
      }
    })),
    setInterventions: (interventions) => set({ activeInterventions: interventions }),
    resetInterventions: () => set({
      activeInterventions: { navyEscorts: false, sprRelease: false, opecNegotiation: false }
    }),

    setDemoStep: (step) => set((state) => {
      let targetTime = state.demoTime;
      if (step === 1) targetTime = 0;
      else if (step === 2) targetTime = 20;
      else if (step === 3) targetTime = 45;
      else if (step === 4) targetTime = 65;

      return {
        demoStep: step,
        demoTime: targetTime,
        demoStepStartedAt: step > 0 ? new Date() : null
      };
    }),
    setDemoTime: (time) => set((state) => {
      let step = 0;
      if (time >= 0 && time < 20) step = 1;
      else if (time >= 20 && time < 45) step = 2;
      else if (time >= 45 && time < 65) step = 3;
      else if (time >= 65 && time < 90) step = 4;
      else step = 0;

      return {
        demoTime: time,
        demoStep: step,
        demoStepStartedAt: state.demoStep !== step ? new Date() : state.demoStepStartedAt
      };
    }),
    incrementDemoTime: () => set((state) => {
      const nextTime = state.demoTime + 1;
      if (nextTime >= 90) {
        return {
          demoRunning: false,
          demoPaused: false,
          demoStep: 0,
          demoTime: 0,
          demoStepStartedAt: null
        };
      }
      
      let step = state.demoStep;
      if (nextTime >= 0 && nextTime < 20) step = 1;
      else if (nextTime >= 20 && nextTime < 45) step = 2;
      else if (nextTime >= 45 && nextTime < 65) step = 3;
      else if (nextTime >= 65 && nextTime < 90) step = 4;

      return {
        demoTime: nextTime,
        demoStep: step,
        demoStepStartedAt: state.demoStep !== step ? new Date() : state.demoStepStartedAt
      };
    }),
    pauseDemo: () => set({ demoPaused: true }),
    resumeDemo: () => set({ demoPaused: false }),
    stopDemo: () => set({
      demoRunning: false,
      demoPaused: false,
      demoStep: 0,
      demoTime: 0,
      demoStepStartedAt: null
    }),
    startDemo: () => set({
      demoRunning: true,
      demoPaused: false,
      demoStep: 1,
      demoTime: 0,
      demoStepStartedAt: new Date()
    })
  }))
);

// Subscribe to automatically calculate derived resilienceScore
useSentinelStore.subscribe(
  (state) => [state.corridorScores, state.scenarioOutput, state.activeInterventions] as const,
  ([corridorScores, scenarioOutput, activeInterventions]) => {
    const score = calculateResilienceScore(corridorScores, scenarioOutput, activeInterventions);
    useSentinelStore.setState({ resilienceScore: score });
  },
  {
    fireImmediately: true,
    equalityFn: (a, b) =>
      a[0].hormuz === b[0].hormuz &&
      a[0].redSea === b[0].redSea &&
      a[0].suez === b[0].suez &&
      a[1]?.refinery_run_rate_drop === b[1]?.refinery_run_rate_drop &&
      a[1]?.days_of_cover === b[1]?.days_of_cover &&
      a[1]?.gdp_drag === b[1]?.gdp_drag &&
      a[2].navyEscorts === b[2].navyEscorts &&
      a[2].sprRelease === b[2].sprRelease &&
      a[2].opecNegotiation === b[2].opecNegotiation
  }
);
