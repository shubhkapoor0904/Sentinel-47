import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ProcurementOption {
  name: string;
  source: string;
  pricePremium: number; // USD per barrel over Brent
  transitDays: number;
  portCongestion: "Low" | "Medium" | "High";
  compatibility: number; // 0 to 100
  overallScore: number; // 0 to 100
  reasoning: string;
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const { scenarioId = "custom", capacityLoss = 10, brentPrice = 74.50 } = body;

  let rankedOptions: ProcurementOption[] = [];
  let isLlmUsed = false;

  const defaultAlternatives = [
    {
      name: "West African Sweet Blend",
      source: "Angola & Nigeria (Atlantic)",
      pricePremium: 2.20,
      transitDays: 22,
      portCongestion: "Low",
      compatibility: 92,
    },
    {
      name: "US WTI Midland",
      source: "US Gulf Coast (Galveston)",
      pricePremium: 3.50,
      transitDays: 28,
      portCongestion: "Medium",
      compatibility: 88,
    },
    {
      name: "Russian Urals (Far East Route)",
      source: "Kozmino Port (Vladivostok)",
      pricePremium: -2.80, // discounted
      transitDays: 18,
      portCongestion: "High",
      compatibility: 78,
    },
    {
      name: "Strategic Petroleum Reserve Drawdown",
      source: "Domestic (Visakhapatnam & Padur)",
      pricePremium: 0.00,
      transitDays: 1,
      portCongestion: "Low",
      compatibility: 100,
    },
    {
      name: "North Sea Brent (Alternate Route)",
      source: "Norway & UK (Rotterdam Bypass)",
      pricePremium: 4.10,
      transitDays: 32,
      portCongestion: "Low",
      compatibility: 85,
    }
  ];

  // 1. LLM Generation
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
        You are the Sentinel-47 Procurement Orchestrator Agent.
        Rank and score the following alternative crude oil sources for Indian refineries based on the active disruption scenario:
        
        Active Disruption: "${scenarioId}" with a ${capacityLoss}% supply capacity loss.
        Current Brent crude baseline: $${brentPrice}/barrel.

        Alternatives to evaluate and adjust:
        ${JSON.stringify(defaultAlternatives, null, 2)}

        For each option, recalculate:
        1. pricePremium (adjust slightly based on demand spikes, transit risks).
        2. transitDays (e.g. if Red Sea is suspended, Atlantic routes to India must transit via the Cape of Good Hope, adding 10-14 days).
        3. portCongestion (Low/Medium/High).
        4. compatibility (0-100%).
        5. overallScore (0-100, where higher is better, considering low premium, low transit days, low congestion, high compatibility).
        6. reasoning: A 2-3 line chain-of-thought explanation detail explaining why this rank was assigned and the tactical trade-offs.

        Return ONLY a JSON array containing these options, sorted by overallScore in descending order, matching the schema:
        [
          {
            "name": "...",
            "source": "...",
            "pricePremium": number,
            "transitDays": number,
            "portCongestion": "Low" | "Medium" | "High",
            "compatibility": number,
            "overallScore": number,
            "reasoning": "..."
          }
        ]
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const parsed = JSON.parse(responseText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        rankedOptions = parsed;
        isLlmUsed = true;
      }
    } catch (e) {
      console.error("Procurement Orchestrator LLM call failed, using rule-based calculations:", e);
    }
  }

  // 2. Rule-Based Fallback Math (Simulated Agent)
  if (rankedOptions.length === 0) {
    rankedOptions = defaultAlternatives.map((alt) => {
      let premium = alt.pricePremium;
      let transit = alt.transitDays;
      let congestion = alt.portCongestion;
      let compatibility = alt.compatibility;
      let score = 70;
      let reasoning = "";

      // Adapt metrics and write reasoning based on scenario context
      if (scenarioId === "hormuz_50") {
        if (alt.name.includes("Reserve")) {
          // SPR is extremely valuable in Hormuz blockage since it bypasses ocean completely
          premium = 0.00;
          transit = 1;
          congestion = "Low";
          score = 98;
          reasoning = "CRITICAL PATH: Zero maritime transit risk. Bypasses the Persian Gulf choke points entirely to deliver immediate refinery feedstock, preserving operational run-rates for a crucial 9.5 days.";
        } else if (alt.name.includes("West African")) {
          premium = 3.50; // Premium rises due to spot demand
          transit = 22; // Atlantic routing is normal
          congestion = "Medium";
          score = 82;
          reasoning = "STRATEGIC ALTERNATIVE: Bypasses the Hormuz strait entirely. High compatibility with PSU refineries. Increased spot demand pushes premium up by $1.30/bbl, but transit lanes remain clear.";
        } else if (alt.name.includes("Russian")) {
          premium = -1.20; // Russian discount narrows due to desperate buyers
          transit = 30; // Shipped via northern/eastern routes due to Gulf blockage
          congestion = "High";
          score = 72;
          reasoning = "TACTICAL CO-SOURCE: Discount narrows as competition increases. Port congestion in Vladivostok is elevated, and longer transit times increase financing/holding costs by 12 days.";
        } else if (alt.name.includes("US")) {
          premium = 4.80; // High premium
          transit = 28;
          congestion = "Medium";
          score = 75;
          reasoning = "STABLE SUPPLY: WTI Midland provides high quality sweet crude. Fully avoids Middle East geopolitical risk, but high price premium and 28-day transit limit immediate shock-absorption capacity.";
        } else {
          premium = 5.20;
          transit = 32;
          congestion = "Low";
          score = 64;
          reasoning = "MARGINAL OPTION: High freight rates and extensive 32-day transit times make North Sea barrels the option of last resort during an active Hormuz bottleneck.";
        }
      } else if (scenarioId === "red_sea_full") {
        if (alt.name.includes("West African")) {
          // Normal route is clear
          premium = 2.50;
          transit = 22;
          congestion = "Low";
          score = 88;
          reasoning = "PRIMARY OCEAN OPTION: Bypasses the Suez Canal and Red Sea altogether. Transit lines across the Atlantic and Indian Oceans are unaffected. Highly compatible with domestic configurations.";
        } else if (alt.name.includes("Reserve")) {
          premium = 0.00;
          transit = 1;
          congestion = "Low";
          score = 95;
          reasoning = "IMMEDIATE DEFENSE: Immediate release allows refiners to maintain full run-rates while alternative sea routes around Africa are established, avoiding a 12-day supply gap.";
        } else if (alt.name.includes("Russian")) {
          // Shipped from Baltic, must now go around Cape of Good Hope, adding 12 days!
          premium = -2.00;
          transit = 34; // increased from 18 to 34
          congestion = "Medium";
          score = 68;
          reasoning = "LOGISTICS BOTTLENECK: Baltic Urals crude must reroute around the Cape of Good Hope, adding 16 transit days. Discount remains high, but cash flow is tied up in transit.";
        } else if (alt.name.includes("US")) {
          // Atlantic route around Africa is unaffected
          premium = 3.80;
          transit = 28;
          congestion = "Medium";
          score = 78;
          reasoning = "STABLE RESILIENCE: Avoids Red Sea completely. WTI Midland offers consistent quality, but price premium is high and 28-day transit leaves India exposed in the near term.";
        } else {
          premium = 5.50; // High freight around Africa
          transit = 44; // increased from 32
          congestion = "Low";
          score = 55;
          reasoning = "SEVERE LAG: North Sea crude must reroute around Africa, pushing transit to 44 days. Freight premiums make this financially unviable except under extreme emergency.";
        }
      } else {
        // Custom or General
        const lossFrac = capacityLoss / 100;
        if (alt.name.includes("Reserve")) {
          premium = 0.00;
          transit = 1;
          congestion = "Low";
          score = Math.round(90 + lossFrac * 10);
          reasoning = "LOCAL INVENTORY: The most efficient immediate buffer. Bypasses all global maritime risks. Drawdowns should be throttled based on the expected duration of the crisis.";
        } else if (alt.name.includes("West African")) {
          premium = Math.round((alt.pricePremium + lossFrac * 1.5) * 100) / 100;
          transit = alt.transitDays;
          congestion = "Low";
          score = Math.round(85 - lossFrac * 10);
          reasoning = "BALANCED TACTICAL SOURCING: Offers high compatibility and stable transport lanes. Slight price premium inflation occurs as global demand shifts away from disrupted zones.";
        } else if (alt.name.includes("Russian")) {
          premium = Math.round((alt.pricePremium - lossFrac * 1.0) * 100) / 100;
          transit = Math.round(alt.transitDays + lossFrac * 10);
          congestion = "High";
          score = Math.round(75 - lossFrac * 15);
          reasoning = "DISCOUNTED SOURCE: Offers financial discount, but has logistically complex tanker availability and high port wait times. Heavy grade requires blending.";
        } else if (alt.name.includes("US")) {
          premium = Math.round((alt.pricePremium + lossFrac * 1.2) * 100) / 100;
          transit = alt.transitDays;
          congestion = "Medium";
          score = Math.round(80 - lossFrac * 10);
          reasoning = "VOLUME DEFENSE: WTI crude provides high volume stability. Avoids the Persian Gulf and Red Sea, but requires 28-day transport planning cycles.";
        } else {
          premium = Math.round((alt.pricePremium + lossFrac * 2.0) * 100) / 100;
          transit = alt.transitDays;
          congestion = "Medium";
          score = Math.round(68 - lossFrac * 15);
          reasoning = "LONG-RANGE FILLER: Bypasses central hotspots but excessive transit times and high premium limit its cost-benefit score.";
        }
      }

      return {
        name: alt.name,
        source: alt.source,
        pricePremium: premium,
        transitDays: transit,
        portCongestion: congestion as "Low" | "Medium" | "High",
        compatibility: compatibility,
        overallScore: score,
        reasoning,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  return NextResponse.json({
    status: "success",
    isLlmUsed,
    scenarioId,
    capacityLoss,
    options: rankedOptions,
    timestamp: new Date().toISOString(),
  });
}
