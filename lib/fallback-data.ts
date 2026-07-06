import { Signal } from "../store/sentinel";

export const FALLBACK_SIGNALS: Signal[] = [
  {
    id: "fb-1",
    source: "Reuters",
    headline: "Coalition forces intercept attack drones over southern Red Sea shipping lanes",
    corridor: "Red Sea",
    event_type: "Drone Interception",
    severity_0to10: 6.0,
    confidence: 0.85,
    reasoning: "Active hostilities force shipping lines to bypass Bab-el-Mandeb, increasing transit times around Africa by 10-14 days.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "fb-2",
    source: "AP News",
    headline: "Iran conducts naval exercises near Strait of Hormuz amid high alert status",
    corridor: "Hormuz",
    event_type: "Naval Exercises",
    severity_0to10: 4.5,
    confidence: 0.90,
    reasoning: "Drills near Hormuz threaten regional shipping flows, causing prompt price premiums in global energy markets.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "fb-3",
    source: "Bloomberg",
    headline: "OPEC+ extends voluntary output curbs of 2.2M barrels through end of quarter",
    corridor: "Global",
    event_type: "Production Cut",
    severity_0to10: 6.5,
    confidence: 0.95,
    reasoning: "Sustained output limitations keep market balances tight, raising procurement costs for Asian importers.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "fb-4",
    source: "Financial Times",
    headline: "Suez Canal cargo transit volume drops 40% as shipping lines bypass Red Sea",
    corridor: "Suez",
    event_type: "Transit Collapse",
    severity_0to10: 5.5,
    confidence: 0.88,
    reasoning: "Diverting traffic around Africa reduces Suez transit revenues and adds shipping days to Europe-bound trade.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "fb-5",
    source: "Lloyds List",
    headline: "Maritime insurance rates surge 15% for shipments traversing high-risk straits",
    corridor: "Global",
    event_type: "Insurance Premium",
    severity_0to10: 5.0,
    confidence: 0.92,
    reasoning: "Increased insurance premiums reflect structural war risks, impacting commercial margins on trade routes.",
    timestamp: new Date().toISOString(),
  }
];

export const FALLBACK_PRICE = 72.60;
