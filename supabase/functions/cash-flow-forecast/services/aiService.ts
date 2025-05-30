
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
    payables: summarizeFinancialData(historicalData.payables, 'due_date', 'amount'),
    receivables: summarizeFinancialData(historicalData.receivables, 'due_date', 'amount'),
    expenses: summarizeFinancialData(historicalData.expenses, 'date', 'amount'),
    sales: summarizeFinancialData(historicalData.sales, 'date', 'price'),
    bankAccounts: historicalData.bankAccounts.map((acc: any) => ({
      name: acc.name,
      balance: acc.balance,
      currency: acc.currency,
      type: acc.type
    })),
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPayments: upcomingCreditPayments.map((payment: any) => ({
      accountName: payment.accountName,
      amount: payment.amount,
      dueDate: payment.dueDate,
      type: payment.type
    })),
    // Weekly breakdowns for the AI to use
    weeklyScheduledPayables: groupByWeek(historicalData.payables, 'due_date', 'amount'),
    weeklyScheduledCreditPayments: groupByWeek(upcomingCreditPayments, 'dueDate', 'amount'),
    weeklyScheduledReceivables: groupByWeek(historicalData.receivables, 'due_date', 'amount'),
    expensePatterns: analyzeExpensePatterns(historicalData.expenses || [])
  };
  
  // Create prompt for OpenAI
  const prompt = createAIPrompt(historicalSummary, config);
  
  try {
    console.log("[DEBUG - AI Request] Sending request to OpenAI with configuration:", {
      model: "gpt-4o-mini",
      messageCount: 2,
      promptLength: prompt.length,
      responseFormat: "json_object"
    });
    
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
            content: "You are a financial forecasting AI assistant specialized in creating accurate and variable weekly cash flow forecasts. You analyze scheduled payments, historical patterns, and financial trends to project different cash flows for each week."
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
      console.log("[DEBUG - AI Raw Response]", aiData.choices[0].message.content);
      
      const parsedResponse = JSON.parse(aiData.choices[0].message.content);
      
      // Log the parsed weekly forecasts to check for variations
      if (parsedResponse.weeklyForecasts && parsedResponse.weeklyForecasts.length > 0) {
        console.log("[DEBUG - AI Parsed Response] First 3 weeks of forecasts:", 
          JSON.stringify(parsedResponse.weeklyForecasts.slice(0, 3), null, 2)
        );
        
        // Check if all weekly amounts are identical
        const allOutflows = parsedResponse.weeklyForecasts.map((week: any) => week.predictedOutflows);
        const allInflows = parsedResponse.weeklyForecasts.map((week: any) => week.predictedInflows);
        
        const uniqueOutflows = new Set(allOutflows).size;
        const uniqueInflows = new Set(allInflows).size;
        
        console.log("[DEBUG - AI Response Analysis] Uniqueness check:", {
          totalWeeks: parsedResponse.weeklyForecasts.length,
          uniqueOutflowValues: uniqueOutflows,
          uniqueInflowValues: uniqueInflows,
          allOutflowsIdentical: uniqueOutflows === 1,
          allInflowsIdentical: uniqueInflows === 1
        });
      }
      
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

// Helper function to group financial data by week
function groupByWeek(items: any[], dateField: string, amountField: string) {
  if (!items?.length) return [];
  
  const today = new Date();
  const weeklyData: Record<number, number> = {};
  
  items.forEach(item => {
    const date = new Date(item[dateField]);
    if (!date) return;
    
    // Calculate which week this falls into (0 = current week, 1 = next week, etc.)
    const diffTime = Math.abs(date.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7);
    
    // Only include items for the next 13 weeks
    if (weekNumber < 0 || weekNumber >= 13) return;
    
    if (!weeklyData[weekNumber]) {
      weeklyData[weekNumber] = 0;
    }
    
    weeklyData[weekNumber] += Number(item[amountField]) || 0;
  });
  
  // Convert to array format expected by AI
  return Object.entries(weeklyData).map(([week, total]) => ({
    weekNumber: parseInt(week) + 1, // Make week numbers 1-based
    totalAmount: total
  }));
}

// Helper function to analyze expense patterns
function analyzeExpensePatterns(expenses: any[]): any[] {
  // Implement logic to analyze expense patterns
  return [];
}
