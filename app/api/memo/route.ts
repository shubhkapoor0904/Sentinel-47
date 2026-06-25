import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface MemoStructure {
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
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const {
    corridors = {},
    brentPrice = 74.50,
    brentSource = "Yahoo Finance",
    scenarioName = "Baseline",
    capacityLoss = 0,
    impact = {},
    procurementOptions = [],
    computationTimeMs = 150,
  } = body;

  const dateString = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const memoId = `S47-MOPNG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let memo: MemoStructure | null = null;
  let isLlmUsed = false;

  const topOptions = procurementOptions.slice(0, 2);
  const sprOption = procurementOptions.find((opt: any) => opt.name.includes("Strategic"));

  // 1. LLM Brief Synthesis
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
        You are the Lead Policy Advisor for Sentinel-47. 
        Compile an official, ministry-ready Executive Decision Memo for the Ministry of Petroleum & Natural Gas, Government of India.
        Synthesize the following live supply chain security telemetry:

        Memo Metadata:
        - Memo ID: ${memoId}
        - Date: ${dateString}
        - To: Minister of Petroleum & Natural Gas, Government of India
        - From: Sentinel-47 Energy Security Resilience System
        - Subject: CRITICAL SUPPLY DISRUPTION RESPONSES & CRUDE SOURCING STRATEGY

        Geopolitical Telemetry:
        - Brent Price: $${brentPrice} (Source: ${brentSource})
        - Active Corridor Disruption Probability:
          ${JSON.stringify(corridors, null, 2)}

        Disruption Scenario:
        - Active Scenario: ${scenarioName} (${capacityLoss}% capacity loss)
        - Modeled Impact on India:
          - Refinery Run-Rate Drop: ${impact.refinery_run_rate_drop}%
          - Retail Fuel Price Change: +Rs. ${impact.fuel_price_delta}/litre
          - SPR Days of Cover Remaining: ${impact.days_of_cover} days (out of 9.5 days baseline)
          - GDP Drag: ${impact.gdp_drag}%
          - Stated Modeling Assumptions: ${JSON.stringify(impact.assumptions)}

        Top Ranked Procurement Alternatives:
        ${JSON.stringify(topOptions, null, 2)}
        
        SPR (Strategic Petroleum Reserve) Status:
        ${sprOption ? `Domestic SPR can provide immediate release (Score: ${sprOption.overallScore}/100, transit 1 day, premium $0.00).` : "No SPR data."}

        Time Taken to generate this response: ${(computationTimeMs / 1000).toFixed(2)} seconds.

        Format the brief into a highly polished JSON structure:
        - executiveSummary: A formal 3-4 sentence paragraph highlighting the threat and immediate strategic posture.
        - riskAssessment: A list of 3-4 bullet points detailing specific corridor risks based on the telemetry. Include Brent price impact.
        - impactFindings: A list of 3-4 descriptive bullet points summarizing the cascading impacts on the Indian economy (refinery run-rate drop, retail price spike, SPR day-of-cover remaining, GDP drag). Do not prefix items with numbers.
        - procurementDirectives: A list of 2-3 specific actionable directives advising the government on how to allocate contracts to the top procurement alternatives, citing their transit days and premiums.
        - sprDirectives: A single clear directive regarding SPR release rate and duration to offset the supply gap.
        - signature: "Director-General, Sentinel-47 Energy Intelligence Command"
        - timeSavedStatement: A single sentence linking the computation time to the McKinsey 47-day statistic, e.g., "Decision support brief generated in X.XX seconds, reducing the un-integrated 47-day stabilization latency to an immediate tactical response."

        Ensure the tone is authoritative, official, precise, and contains specific figures. Do not output placeholders.
        Return ONLY a JSON object matching this structure:
        {
          "memoId": "${memoId}",
          "date": "${dateString}",
          "to": "...",
          "from": "...",
          "subject": "...",
          "executiveSummary": "...",
          "riskAssessment": [ "...", "..." ],
          "impactFindings": [ "...", "..." ],
          "procurementDirectives": [ "...", "..." ],
          "sprDirectives": "...",
          "signature": "...",
          "timeSavedStatement": "..."
        }
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const parsed = JSON.parse(responseText);

      if (
        parsed.executiveSummary &&
        Array.isArray(parsed.riskAssessment) &&
        Array.isArray(parsed.impactFindings) &&
        Array.isArray(parsed.procurementDirectives) &&
        parsed.sprDirectives &&
        parsed.timeSavedStatement
      ) {
        memo = parsed;
        isLlmUsed = true;
      }
    } catch (e) {
      console.error("Memo Compiler LLM call failed, using template compiler:", e);
    }
  }

  // 2. Structured Template Fallback (Simulated Agent)
  if (!memo) {
    const timeSec = (computationTimeMs / 1000).toFixed(2);
    
    // Formulate a detailed summary based on active scenario
    let executiveSummary = "";
    let riskAssessment: string[] = [];
    let impactFindings: string[] = [];
    let procurementDirectives: string[] = [];
    let sprDirectives = "";

    if (capacityLoss > 0) {
      executiveSummary = `A severe supply chain threat is active due to the ${scenarioName} scenario, resulting in an estimated ${capacityLoss}% loss of transport capacity through critical energy corridors. Sentinel-47 has mobilized telemetry and procurement routes. Immediate action is required to maintain domestic refinery run-rates, mitigate consumer fuel price shocks, and secure alternative shipping channels.`;
      
      riskAssessment = [
        `Brent Crude prices are hovering at $${brentPrice.toFixed(2)}/bbl, incorporating a high-risk premium due to the active supply bottlenecks.`,
        corridors.Hormuz?.score > 30 ? `The Strait of Hormuz threat level is currently at ${corridors.Hormuz.score}% (${corridors.Hormuz.status}), restricting flow of imports which typically account for 40%+ of domestic crude.` : "The Strait of Hormuz remains operational but under high-surveillance monitoring.",
        corridors["Red Sea"]?.score > 30 ? `The Red Sea corridor shows a critical disruption probability of ${corridors["Red Sea"].score}% (${corridors["Red Sea"].status}), forcing vessel rerouting around Africa.` : "Red Sea transit lanes show stable flow with minor delays.",
        `Insurance war-risk premiums have increased, raising transport costs across all Middle-Eastern waterways.`
      ];

      impactFindings = [
        `Refinery Operations: National run-rates are projected to drop by ${impact.refinery_run_rate_drop || 0}%, leading to potential regional shortfalls in diesel and jet fuel.`,
        `Economic Shocks: Domestic retail gasoline and diesel prices are estimated to spike by Rs. ${impact.fuel_price_delta || 0.0}/litre if spot price increases are fully passed to consumers.`,
        `Reserve Depletion: India's Strategic Petroleum Reserve (SPR) days-of-cover will shrink from 9.5 days to ${impact.days_of_cover || 9.5} days under the current draw rate.`,
        `GDP Drag: The combined energy price shock and supply friction is estimated to induce a ${impact.gdp_drag || 0.0}% drag on quarterly GDP growth.`
      ];

      procurementDirectives = topOptions.map((opt: any, idx: number) => {
        return `Directive ${idx + 1}: Authorize emergency crude contracts for ${opt.name} sourcing from ${opt.source}. This route carries a price premium of +$${opt.pricePremium.toFixed(2)}/barrel and is scheduled for a ${opt.transitDays}-day tanker transit cycle, bypassing active threat sectors.`;
      });

      if (sprOption && sprOption.overallScore > 75) {
        sprDirectives = `Initiate immediate release from Padur and Visakhapatnam SPR reserves at a rate of 1.2 million barrels per day. This release will maintain refinery run-rates during the ${topOptions[0]?.transitDays || 22}-day maritime transit lag of alternative cargo.`;
      } else {
        sprDirectives = `Hold SPR reserves as a secondary line of defense. Restrict drawdowns and prioritize commercial stock blending and minor demand-side management.`;
      }
    } else {
      // Baseline Scenario
      executiveSummary = `India's crude oil supply corridors are currently operating under normal parameters. Sentinel-47 is continuously monitoring regional tension headlines and Brent crude price volatility. Current strategic reserves are at full capacity, and maritime routes are stable.`;
      
      riskAssessment = [
        `Brent Crude prices are stable at $${brentPrice.toFixed(2)}/bbl with standard market fluctuations.`,
        "The Strait of Hormuz disruption probability is registered at a nominal baseline of 15%.",
        "Red Sea and Suez Canal transit lanes report standard vessel tracking profiles."
      ];

      impactFindings = [
        "Refinery processing runs at 100% capacity against standard crude slates.",
        "Retail fuel price volatility is within normal historical deviation margins (+/- Rs. 0.20/litre).",
        "Strategic Petroleum Reserve (SPR) remains fully stocked at 9.5 days of net import cover."
      ];

      procurementDirectives = [
        "Maintain standard long-term contract allocations with primary Gulf suppliers.",
        "Monitor alternative spot market discounts for opportunistic hedging."
      ];

      sprDirectives = "Maintain SPR inventories at 100% fill level. No drawdown is authorized under baseline conditions.";
    }

    memo = {
      memoId,
      date: dateString,
      to: "Minister of Petroleum & Natural Gas, Government of India",
      from: "Sentinel-47 Energy Security Intelligence System",
      subject: "EMERGENCY OIL SUPPLY RESILIENCE & PROCUREMENT ACTION PLAN",
      executiveSummary,
      riskAssessment,
      impactFindings,
      procurementDirectives,
      sprDirectives,
      signature: "Director-General, Sentinel-47 Intelligence Command Center",
      timeSavedStatement: `Decision support brief generated in ${timeSec} seconds, reducing the un-integrated 47-day stabilization latency to an immediate tactical response.`
    };
  }

  return NextResponse.json({
    status: "success",
    isLlmUsed,
    memo,
    timestamp: new Date().toISOString(),
  });
}
