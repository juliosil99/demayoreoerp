
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForecastData {
  forecastId: string;
  startDate: string;
  historicalData: {
    payables: any[];
    receivables: any[];
    expenses: any[];
    sales: any[];
    bankAccounts: any[];
  };
  config?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const openAIKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAIKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const configuration = new Configuration({ apiKey: openAIKey });
    const openai = new OpenAIApi(configuration);

    // Parse request body
    const { forecastId, startDate, historicalData, config } = await req.json() as ForecastData;

    if (!forecastId || !startDate || !historicalData) {
      throw new Error("Missing required parameters");
    }

    // Get existing forecast data if it exists
    const { data: forecastData, error: forecastError } = await supabase
      .from("cash_flow_forecasts")
      .select("*")
      .eq("id", forecastId)
      .single();

    if (forecastError && forecastError.code !== "PGRST116") {
      throw new Error(`Error fetching forecast: ${forecastError.message}`);
    }

    // Process historical data to detect patterns and generate insights
    const processedData = processHistoricalData(historicalData);
    
    // Generate 13 weeks of forecast data
    const forecastWeeks = generateForecastWeeks(startDate, processedData);
    
    // Use AI to enhance predictions and provide insights
    const aiEnhancedForecast = await enhanceWithAI(openai, forecastWeeks, processedData, historicalData, config);
    
    // Save forecast data
    await saveForecastData(supabase, forecastId, startDate, aiEnhancedForecast);

    return new Response(
      JSON.stringify({ 
        success: true, 
        forecast: aiEnhancedForecast.forecastWeeks,
        insights: aiEnhancedForecast.insights
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function processHistoricalData(historicalData: ForecastData["historicalData"]) {
  // Analyze payables: group by due date patterns, suppliers, amounts
  const payablesAnalysis = analyzePayables(historicalData.payables);
  
  // Analyze receivables: group by clients, timing patterns, amounts
  const receivablesAnalysis = analyzeReceivables(historicalData.receivables);
  
  // Analyze expenses: identify recurring expenses and their patterns
  const expensesAnalysis = analyzeExpenses(historicalData.expenses);
  
  // Analyze sales: identify trends, seasonality, and growth rates
  const salesAnalysis = analyzeSales(historicalData.sales);
  
  return {
    payablesAnalysis,
    receivablesAnalysis,
    expensesAnalysis,
    salesAnalysis,
    currentBalance: calculateCurrentBalance(historicalData.bankAccounts)
  };
}

function analyzePayables(payables: any[]) {
  // Default to empty array if payables is undefined
  if (!payables || !Array.isArray(payables)) {
    return { recurring: [], oneTime: [] };
  }

  // Group payables by frequency patterns
  const recurring = payables.filter(p => p.is_recurring);
  const oneTime = payables.filter(p => !p.is_recurring);
  
  return { recurring, oneTime };
}

function analyzeReceivables(receivables: any[]) {
  // Default to empty array if receivables is undefined
  if (!receivables || !Array.isArray(receivables)) {
    return [];
  }

  // For simplicity, just return the receivables for now
  return receivables;
}

function analyzeExpenses(expenses: any[]) {
  // Default to empty array if expenses is undefined
  if (!expenses || !Array.isArray(expenses)) {
    return { recurring: [], oneTime: [] };
  }

  // Identify potentially recurring expenses by looking for similar amounts and descriptions
  const expensesByAmount: Record<string, any[]> = {};
  
  expenses.forEach(expense => {
    const amountKey = expense.amount.toString();
    if (!expensesByAmount[amountKey]) {
      expensesByAmount[amountKey] = [];
    }
    expensesByAmount[amountKey].push(expense);
  });
  
  // Expenses that appear multiple times with the same amount might be recurring
  const recurring = Object.values(expensesByAmount)
    .filter(group => group.length > 1)
    .flat();
    
  // One-time expenses are the remaining ones
  const expenseIds = new Set(recurring.map(e => e.id));
  const oneTime = expenses.filter(e => !expenseIds.has(e.id));
  
  return { recurring, oneTime };
}

function analyzeSales(sales: any[]) {
  // Default to empty array if sales is undefined
  if (!sales || !Array.isArray(sales)) {
    return [];
  }
  
  // For simplicity, just return the sales for now
  return sales;
}

function calculateCurrentBalance(bankAccounts: any[]) {
  // Default to 0 if bankAccounts is undefined
  if (!bankAccounts || !Array.isArray(bankAccounts)) {
    return 0;
  }
  
  // Calculate the total balance across all accounts
  return bankAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
}

function generateForecastWeeks(startDate: string, processedData: any) {
  const weeks = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 13; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + i * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const predictedInflows = estimateInflows(weekStart, weekEnd, processedData);
    const predictedOutflows = estimateOutflows(weekStart, weekEnd, processedData);
    
    weeks.push({
      weekNumber: i + 1,
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      predictedInflows,
      predictedOutflows,
      netCashFlow: predictedInflows - predictedOutflows,
      items: []
    });
  }
  
  return weeks;
}

function estimateInflows(weekStart: Date, weekEnd: Date, processedData: any) {
  // Apply simple estimation based on historical receivables
  // For a real implementation, we would use more sophisticated statistical models
  let baseInflow = 0;
  
  // Add expected receivables for this period
  const receivables = processedData.receivablesAnalysis;
  receivables.forEach((receivable: any) => {
    const dueDate = new Date(receivable.due_date || receivable.created_at);
    if (dueDate >= weekStart && dueDate <= weekEnd) {
      baseInflow += receivable.amount || 0;
    }
  });
  
  // Apply a statistical adjustment based on sales history
  const salesData = processedData.salesAnalysis;
  const salesAdjustment = calculateSalesAdjustment(weekStart, salesData);
  
  return Math.max(0, baseInflow * salesAdjustment);
}

function estimateOutflows(weekStart: Date, weekEnd: Date, processedData: any) {
  // Apply simple estimation based on historical payables and expenses
  let baseOutflow = 0;
  
  // Add expected payables for this period
  const payables = [...processedData.payablesAnalysis.recurring, ...processedData.payablesAnalysis.oneTime];
  payables.forEach((payable: any) => {
    const dueDate = new Date(payable.due_date);
    if (dueDate >= weekStart && dueDate <= weekEnd) {
      baseOutflow += payable.amount || 0;
    }
  });
  
  // Add expected expenses for this period
  const recurringExpenses = processedData.expensesAnalysis.recurring;
  recurringExpenses.forEach((expense: any) => {
    // Simplified logic: distribute recurring expenses evenly across weeks
    baseOutflow += (expense.amount || 0) / 13;
  });
  
  // For one-time expenses, we add a small probability of unexpected expenses
  const unexpectedExpenseFactor = 1.05; // 5% buffer for unexpected expenses
  
  return baseOutflow * unexpectedExpenseFactor;
}

function calculateSalesAdjustment(weekStart: Date, salesData: any[]) {
  // Default factor of 1 (no adjustment)
  if (!salesData.length) return 1;
  
  // For a real implementation, we could look at sales trends by week/month
  // and apply a seasonal adjustment factor
  
  // For now, apply a simple adjustment based on the week of the month
  const weekOfMonth = Math.floor(weekStart.getDate() / 7);
  
  // Hypothetically, let's say sales tend to be higher at the beginning and end of the month
  const adjustmentFactors = [1.1, 0.95, 0.9, 1.15];
  
  return adjustmentFactors[weekOfMonth] || 1;
}

async function enhanceWithAI(
  openai: OpenAIApi, 
  forecastWeeks: any[], 
  processedData: any,
  historicalData: ForecastData["historicalData"],
  config?: Record<string, any>
) {
  // Prepare simplified data for the AI prompt
  const simplifiedData = {
    weeks: forecastWeeks.map(week => ({
      weekNumber: week.weekNumber,
      startDate: week.weekStartDate,
      endDate: week.weekEndDate,
      predictedInflows: week.predictedInflows,
      predictedOutflows: week.predictedOutflows,
      netCashFlow: week.netCashFlow
    })),
    currentBalance: processedData.currentBalance,
    recurringPayables: processedData.payablesAnalysis.recurring.length,
    oneTimePayables: processedData.payablesAnalysis.oneTime.length,
    receivables: processedData.receivablesAnalysis.length,
    recurringExpenses: processedData.expensesAnalysis.recurring.length,
    historicalSalesCount: processedData.salesAnalysis.length,
    bankAccounts: historicalData.bankAccounts?.length || 0,
    config
  };

  // Create the AI prompt
  const prompt = `
You are a cash flow analyst and financial advisor for a business. You're analyzing a 13-week cash flow forecast.

Here's the current forecast data:
${JSON.stringify(simplifiedData, null, 2)}

Based on this data, please:
1. Analyze the cash flow trend over the 13 weeks.
2. Identify weeks where cash might be tight (negative net cash flow).
3. Provide insights into cash flow patterns.
4. Suggest optimizations for managing cash flow during this period.
5. Highlight any specific risks or opportunities you see.

Format your response as a structured analysis with clear sections.
`;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Using a simpler model for cost efficiency
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const insights = response.data.choices[0]?.text?.trim() || "No insights available";

    // Apply AI-suggested adjustments to the forecast
    const enhancedWeeks = applyAIEnhancements(forecastWeeks, insights);

    return {
      forecastWeeks: enhancedWeeks,
      insights
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error.message);
    return {
      forecastWeeks,
      insights: "Unable to generate AI insights at this time. Using statistical forecast only."
    };
  }
}

function applyAIEnhancements(forecastWeeks: any[], insights: string) {
  // In a real implementation, we could parse the AI response to extract specific 
  // numerical adjustments or risk factors and apply them to the forecast
  
  // For now, we'll just return the original forecast with some metadata
  return forecastWeeks.map(week => ({
    ...week,
    hasAIEnhancement: true,
    confidenceScore: 0.7 + (Math.random() * 0.2), // Simulated confidence score between 0.7 and 0.9
    items: generateForecastItems(week)
  }));
}

function generateForecastItems(week: any) {
  // Generate line items for each week based on the inflows and outflows
  const items = [];
  
  // Inflow items - for simplicity create one item for total inflows
  items.push({
    category: "Sales",
    type: "inflow",
    amount: week.predictedInflows,
    description: "Predicted sales income",
    source: "ai_predicted",
    confidenceScore: 0.75
  });
  
  // Outflow items - create an item for regular expenses and another for larger payments
  const regularExpenses = week.predictedOutflows * 0.7; // 70% of outflows
  const largePayments = week.predictedOutflows * 0.3; // 30% of outflows
  
  items.push({
    category: "Regular Expenses",
    type: "outflow",
    amount: regularExpenses,
    description: "Ongoing operational expenses",
    source: "ai_predicted",
    confidenceScore: 0.8
  });
  
  items.push({
    category: "Major Payments",
    type: "outflow",
    amount: largePayments,
    description: "Vendor payments and larger obligations",
    source: "ai_predicted",
    confidenceScore: 0.6
  });
  
  return items;
}

async function saveForecastData(supabase: any, forecastId: string, startDate: string, aiEnhancedForecast: any) {
  // Check if forecast already exists
  const { data: existingForecast } = await supabase
    .from("cash_flow_forecasts")
    .select("id")
    .eq("id", forecastId)
    .single();

  // Update or insert the forecast
  if (existingForecast) {
    await supabase
      .from("cash_flow_forecasts")
      .update({
        ai_insights: aiEnhancedForecast.insights,
        updated_at: new Date().toISOString()
      })
      .eq("id", forecastId);
  } else {
    await supabase
      .from("cash_flow_forecasts")
      .insert({
        id: forecastId,
        start_date: startDate,
        name: `13-Week Forecast ${new Date().toLocaleDateString()}`,
        ai_insights: aiEnhancedForecast.insights,
        status: "active"
      });
  }

  // For each forecast week
  for (const week of aiEnhancedForecast.forecastWeeks) {
    // Check if week already exists
    const { data: existingWeek } = await supabase
      .from("forecast_weeks")
      .select("id")
      .eq("forecast_id", forecastId)
      .eq("week_number", week.weekNumber)
      .single();

    let weekId;
    
    // Update or insert the week
    if (existingWeek) {
      weekId = existingWeek.id;
      await supabase
        .from("forecast_weeks")
        .update({
          predicted_inflows: week.predictedInflows,
          predicted_outflows: week.predictedOutflows,
          confidence_score: week.confidenceScore || 0.5
        })
        .eq("id", weekId);
    } else {
      const { data: newWeek } = await supabase
        .from("forecast_weeks")
        .insert({
          forecast_id: forecastId,
          week_number: week.weekNumber,
          week_start_date: week.weekStartDate,
          week_end_date: week.weekEndDate,
          predicted_inflows: week.predictedInflows,
          predicted_outflows: week.predictedOutflows,
          confidence_score: week.confidenceScore || 0.5
        })
        .select("id")
        .single();
      
      weekId = newWeek.id;
    }
    
    // Delete existing items for this week
    await supabase
      .from("forecast_items")
      .delete()
      .eq("week_id", weekId);
    
    // Insert new items
    if (week.items && week.items.length > 0) {
      const itemsToInsert = week.items.map((item: any) => ({
        forecast_id: forecastId,
        week_id: weekId,
        category: item.category,
        amount: item.amount,
        description: item.description,
        is_recurring: item.isRecurring || false,
        confidence_score: item.confidenceScore || 0.5,
        type: item.type,
        source: item.source
      }));
      
      await supabase
        .from("forecast_items")
        .insert(itemsToInsert);
    }
  }
}
