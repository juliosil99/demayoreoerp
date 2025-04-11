
import { summarizeFinancialData } from "../helpers/dataUtils.ts";
import { createAIPrompt } from "../helpers/aiUtils.ts";

interface AIResponse {
  insights: string;
  weeklyForecasts?: any[];
}

export async function generateAIInsights(
  historicalData: any, 
  config: any, 
  openaiApiKey: string,
  availableCashBalance: number,
  creditLiabilities: number,
  netPosition: number,
  upcomingCreditPayments: any[]
): Promise<AIResponse> {
  console.log("[DEBUG - Edge Function] Generating AI insights with OpenAI");
  
  // Prepare historical data summary for OpenAI
  const historicalSummary = {
    payables: summarizeFinancialData(historicalData.payables),
    receivables: summarizeFinancialData(historicalData.receivables),
    expenses: summarizeFinancialData(historicalData.expenses),
    sales: summarizeFinancialData(historicalData.sales),
    bankAccounts: historicalData.bankAccounts.map((acc: any) => ({
      name: acc.name,
      balance: acc.balance,
      currency: acc.currency,
      type: acc.type
    })),
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPayments
  };
  
  // Create prompt for OpenAI with configuration options
  const prompt = createAIPrompt(historicalSummary, config);
  
  try {
    // Call OpenAI API
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a financial forecasting AI assistant. Your task is to analyze financial data and provide cash flow forecasts and insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[DEBUG - Edge Function] OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const aiData = await aiResponse.json();
    console.log("[DEBUG - Edge Function] OpenAI response received");
    
    // Parse the AI response
    try {
      const parsedResponse = JSON.parse(aiData.choices[0].message.content);
      return {
        insights: parsedResponse.insights || "AI analysis completed, but no specific insights were provided.",
        weeklyForecasts: parsedResponse.weeklyForecasts || []
      };
    } catch (parseError) {
      console.error("[DEBUG - Edge Function] Error parsing AI response:", parseError);
      return {
        insights: "AI analysis completed, but there was an error processing the results."
      };
    }
  } catch (aiError) {
    console.error("[DEBUG - Edge Function] Error calling OpenAI:", aiError);
    return {
      insights: "Unable to generate AI-powered insights. Falling back to statistical forecasting."
    };
  }
}
