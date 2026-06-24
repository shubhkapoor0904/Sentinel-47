import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeopoliticalSignal {
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

// Baseline mock headlines in case external News API is not configured
const MOCK_HEADLINES = [
  {
    headline: "Coalition forces intercept three attack drones over southern Red Sea shipping lanes",
    source: "Reuters",
    timestamp: new Date().toISOString(),
  },
  {
    headline: "Iran conducts naval exercises near the Strait of Hormuz amid mounting regional tensions",
    source: "AP News",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    headline: "OPEC+ ministers agree to extend voluntary crude output cuts of 2.2M barrels per day",
    source: "Bloomberg",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    headline: "Egypt reports 40% drop in Suez Canal transit revenues due to vessel rerouting",
    source: "Financial Times",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    headline: "Insurance premiums for crude tankers crossing Middle East corridors surge by 15%",
    source: "Lloyds List",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

export async function GET() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const newsApiKey = process.env.NEWS_API_KEY;

  let rawHeadlines: { headline: string; source: string; timestamp: string }[] = [];
  let isNewsLive = false;

  // 1. Fetch News Headlines (Live or Mock)
  if (newsApiKey) {
    try {
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?q=(Hormuz OR "Red Sea" OR "Iran sanctions" OR "OPEC+" OR "Brent crude")&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`,
        { next: { revalidate: 300 } } // Cache for 5 mins
      );
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        if (newsData.articles && newsData.articles.length > 0) {
          rawHeadlines = newsData.articles.map((art: any) => ({
            headline: art.title,
            source: art.source?.name || "News API",
            timestamp: art.publishedAt || new Date().toISOString(),
          }));
          isNewsLive = true;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch news from NewsAPI, falling back to mock:", e);
    }
  }

  if (rawHeadlines.length === 0) {
    rawHeadlines = MOCK_HEADLINES;
  }

  // 2. Fetch Brent Crude Price (Live from Yahoo Finance or Mock)
  let brentPrice = 74.50;
  let isPriceLive = false;
  try {
    const priceRes = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1d",
      { next: { revalidate: 60 } } // Cache for 1 min
    );
    if (priceRes.ok) {
      const priceData = await priceRes.json();
      const currentPrice = priceData?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (currentPrice) {
        brentPrice = Number(currentPrice);
        isPriceLive = true;
      }
    }
  } catch (e) {
    console.warn("Failed to fetch live Brent price, using mock fallback:", e);
  }

  // 3. Process Risk Signals with LLM (or Simulated Agent Fallback)
  let signals: GeopoliticalSignal[] = [];
  let isLlmUsed = false;

  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
        You are the Sentinel-47 Geopolitical Risk Agent.
        Analyze the following headlines and extract structured risk signals relevant to India's energy supply chain.
        Focus on these corridors: 'Hormuz', 'Red Sea', 'Suez', or 'Global'.
        
        Headlines to analyze:
        ${JSON.stringify(rawHeadlines, null, 2)}

        For EACH headline, return a JSON object with:
        - corridor: Must be exactly one of 'Hormuz', 'Red Sea', 'Suez', or 'Global'.
        - event_type: A short 2-4 word description of the event (e.g. "Drone Interception", "Naval Drill", "Output Cut", "Insurance Increase").
        - severity_0to10: Number between 0 and 10 indicating the level of supply disruption risk.
        - confidence: Number between 0.0 and 1.0 indicating your confidence in this assessment.
        - reasoning: 1-2 sentences explaining why this headline represents a risk to India's oil supply and how it moves the score.
        
        Return ONLY a JSON array containing these objects, matching the structure:
        [
          {
            "corridor": "Hormuz" | "Red Sea" | "Suez" | "Global",
            "event_type": "...",
            "severity_0to10": 5,
            "confidence": 0.85,
            "reasoning": "..."
          }
        ]
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const parsedSignals = JSON.parse(responseText);

      if (Array.isArray(parsedSignals)) {
        signals = parsedSignals.map((sig, idx) => ({
          id: `sig-${idx}`,
          corridor: sig.corridor || "Global",
          event_type: sig.event_type || "Risk Incident",
          severity_0to10: Number(sig.severity_0to10) || 1,
          confidence: Number(sig.confidence) || 0.8,
          source: rawHeadlines[idx % rawHeadlines.length].source,
          timestamp: rawHeadlines[idx % rawHeadlines.length].timestamp,
          reasoning: sig.reasoning || "Analyzed geopolitical signal.",
          headline: rawHeadlines[idx % rawHeadlines.length].headline,
        }));
        isLlmUsed = true;
      }
    } catch (e) {
      console.error("Gemini API call failed, falling back to simulated parser:", e);
    }
  }

  // Fallback Rule-based Parser (Simulated Agent)
  if (signals.length === 0) {
    signals = rawHeadlines.map((item, idx) => {
      const h = item.headline.toLowerCase();
      let corridor: "Hormuz" | "Red Sea" | "Suez" | "Global" = "Global";
      let event_type = "Supply Volatility";
      let severity_0to10 = 3;
      let confidence = 0.85;
      let reasoning = "";

      if (h.includes("hormuz") || h.includes("iran")) {
        corridor = "Hormuz";
        event_type = h.includes("exercise") || h.includes("drill") ? "Naval Drill" : "Strait Blockade Risk";
        severity_0to10 = h.includes("exercise") ? 4 : 7;
        reasoning = "Naval movements or sanctions risk in the Hormuz Strait can choke 40% of India's crude imports, causing immediate premium spikes.";
      } else if (h.includes("red sea") || h.includes("houthi") || h.includes("drone") || h.includes("intercept")) {
        corridor = "Red Sea";
        event_type = "Drone Interception";
        severity_0to10 = 6;
        reasoning = "Active hostilities force shipping lines to bypass the Bab-el-Mandeb, increasing transit times around Africa by 10-14 days.";
      } else if (h.includes("suez") || h.includes("egypt")) {
        corridor = "Suez";
        event_type = "Transit Drop";
        severity_0to10 = 5;
        reasoning = "Suez Canal transit drops disrupt the flow of refined products and Russian crude shipments heading toward Indian refineries.";
      } else if (h.includes("opec") || h.includes("cut") || h.includes("voluntary")) {
        corridor = "Global";
        event_type = "Production Cut";
        severity_0to10 = 6.5;
        reasoning = "OPEC+ supply curbs tighten global balances, putting upward pressure on India's import bills (every $1 increase adds $1.2B to annual deficit).";
      } else {
        corridor = "Global";
        event_type = "Market Premium";
        severity_0to10 = 4;
        reasoning = "General security risk premium reflected in commercial freight and insurance margins for regional trade routes.";
      }

      return {
        id: `sig-${idx}`,
        corridor,
        event_type,
        severity_0to10,
        confidence,
        source: item.source,
        timestamp: item.timestamp,
        reasoning,
        headline: item.headline,
      };
    });
  }

  // 4. Aggregate Probability Scores per Corridor
  // Baseline scores before applying signal modifiers
  const corridorStats = {
    Hormuz: { base: 15, count: 0, sum: 0 },
    "Red Sea": { base: 48, count: 0, sum: 0 },
    Suez: { base: 22, count: 0, sum: 0 },
  };

  signals.forEach((sig) => {
    if (sig.corridor !== "Global" && corridorStats[sig.corridor]) {
      corridorStats[sig.corridor].count += 1;
      corridorStats[sig.corridor].sum += sig.severity_0to10 * sig.confidence;
    }
  });

  const aggregateCorridor = (corridor: "Hormuz" | "Red Sea" | "Suez") => {
    const stats = corridorStats[corridor];
    if (stats.count === 0) {
      return {
        score: stats.base,
        status: stats.base > 40 ? "WARNING" : "STABLE",
      };
    }
    // Calculate score: Blend baseline with weighted news severity
    const signalAvg = (stats.sum / stats.count) * 10; // scale to 0-100
    const finalScore = Math.min(100, Math.round(stats.base * 0.3 + signalAvg * 0.7));
    let status: "STABLE" | "WARNING" | "CRITICAL" = "STABLE";
    if (finalScore >= 65) status = "CRITICAL";
    else if (finalScore >= 35) status = "WARNING";

    return {
      score: finalScore,
      status,
    };
  };

  const finalCorridors = {
    Hormuz: {
      name: "Strait of Hormuz",
      ...aggregateCorridor("Hormuz"),
      description: "Controls 40%+ of Indian crude imports.",
    },
    "Red Sea": {
      name: "Red Sea / Bab-el-Mandeb",
      ...aggregateCorridor("Red Sea"),
      description: "Primary lane for imports from Europe/US & exports.",
    },
    Suez: {
      name: "Suez Canal",
      ...aggregateCorridor("Suez"),
      description: "Vessel transit flow route for Russian crude imports.",
    },
  };

  return NextResponse.json({
    status: "success",
    isNewsLive,
    isPriceLive,
    isLlmUsed,
    brentPrice,
    brentSource: isPriceLive ? "Yahoo Finance (Live)" : "Estimated Default",
    signals,
    corridors: finalCorridors,
    timestamp: new Date().toISOString(),
  });
}
