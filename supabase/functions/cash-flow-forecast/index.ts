
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { OpenAI } from 'https://esm.sh/openai@4.0.0'

// Types for this function
interface ForecastRequest {
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

interface ForecastItemData {
  category: string;
  amount: number;
  type: 'inflow' | 'outflow';
  source: 'historical' | 'ai_predicted';
  description?: string;
  is_recurring?: boolean;
  confidence_score?: number;
}

interface ForecastWeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  predictedInflows: number;
  predictedOutflows: number;
  items: ForecastItemData[];
}

// Function to calculate the expected value based on historical data
function calculateExpectedValue(
  historicalData: any[],
  confidenceAdjustment: number = 1.0
): number {
  if (historicalData.length === 0) return 0;
  
  // Calculate average
  const sum = historicalData.reduce((acc, val) => acc + val, 0);
  const average = sum / historicalData.length;
  
  // Apply confidence adjustment (lower for future periods)
  return average * confidenceAdjustment;
}

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to generate AI insights
async function generateAIInsights(
  historicalData: ForecastRequest['historicalData'],
  forecastData: ForecastWeekData[],
  openai: OpenAI
): Promise<string> {
  try {
    // Create a summary of the data for the AI to analyze
    const weeksWithNegativeCashFlow = forecastData.filter(
      week => week.predictedInflows < week.predictedOutflows
    );
    
    const totalInflows = forecastData.reduce(
      (sum, week) => sum + week.predictedInflows, 0
    );
    
    const totalOutflows = forecastData.reduce(
      (sum, week) => sum + week.predictedOutflows, 0
    );
    
    const netCashFlow = totalInflows - totalOutflows;
    
    // Format the data for the prompt
    const forecastSummary = forecastData.map(week => ({
      weekNumber: week.weekNumber,
      dates: `${week.startDate} to ${week.endDate}`,
      inflows: week.predictedInflows.toFixed(2),
      outflows: week.predictedOutflows.toFixed(2),
      netCashFlow: (week.predictedInflows - week.predictedOutflows).toFixed(2)
    }));
    
    // Get historical data stats
    const historicalStats = {
      totalPayables: historicalData.payables.length,
      totalReceivables: historicalData.receivables.length,
      totalExpenses: historicalData.expenses.length,
      totalSales: historicalData.sales.length
    };
    
    // Create the prompt for the AI
    const prompt = `
      You are a financial analyst specializing in cash flow management for small businesses. 
      You're analyzing a 13-week cash flow forecast with the following data:
      
      FORECAST DATA:
      ${JSON.stringify(forecastSummary, null, 2)}
      
      SUMMARY METRICS:
      - Total Inflows over 13 weeks: $${totalInflows.toFixed(2)}
      - Total Outflows over 13 weeks: $${totalOutflows.toFixed(2)}
      - Net Cash Flow over 13 weeks: $${netCashFlow.toFixed(2)}
      - Number of weeks with negative cash flow: ${weeksWithNegativeCashFlow.length}
      
      HISTORICAL DATA STATS:
      ${JSON.stringify(historicalStats, null, 2)}
      
      Please provide a detailed analysis in Spanish with the following sections:
      
      1. Analysis of Cash Flow Trend: Overall assessment of the 13-week cash flow trend.
      2. Weeks with Potential Cash Flow Issues: Identify specific weeks where cash flow problems might occur.
      3. Cash Flow Patterns: Identify any notable patterns or seasonality.
      4. Cash Flow Optimization Suggestions: Practical recommendations for improving cash flow.
      5. Risks and Opportunities: Highlight potential risks and opportunities based on the forecast.
      
      Each section should be 2-3 paragraphs with specific, actionable insights. Be specific about dollar amounts and timing.
    `;
    
    // Request analysis from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a financial analyst specializing in cash flow management." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return "No se pudieron generar insights debido a un error.";
  }
}

// Main handler for the edge function
serve(async (req) => {
  try {
    // Set up CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse request
    const requestData: ForecastRequest = await req.json();
    const { forecastId, startDate, historicalData, config } = requestData;

    // Validate inputs
    if (!forecastId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing forecast ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Set up OpenAI client if key is available
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

    // Generate the 13-week forecast
    const startDateObj = new Date(startDate);
    const forecastWeeks: ForecastWeekData[] = [];

    // Process each week
    for (let i = 0; i < 13; i++) {
      const weekStartDate = new Date(startDateObj);
      weekStartDate.setDate(weekStartDate.getDate() + (i * 7));
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      
      // Format dates to ISO strings (YYYY-MM-DD)
      const formattedStartDate = formatDate(weekStartDate);
      const formattedEndDate = formatDate(weekEndDate);
      
      // Calculate expected inflows and outflows based on historical data
      // Apply a confidence factor that decreases for weeks further in the future
      const confidenceFactor = Math.max(0.4, 1 - (i * 0.05)); // Starts at 1.0, decreases by 0.05 each week, min 0.4
      
      // Calculate expected inflows from sales and receivables
      let predictedInflows = 0;
      const inflowItems: ForecastItemData[] = [];
      
      // Process sales data for this week
      if (historicalData.sales && historicalData.sales.length > 0) {
        const avgWeeklySales = calculateExpectedValue(
          historicalData.sales.map(sale => sale.price || 0),
          confidenceFactor
        );
        
        if (avgWeeklySales > 0) {
          predictedInflows += avgWeeklySales;
          inflowItems.push({
            category: 'Ventas',
            amount: avgWeeklySales,
            type: 'inflow',
            source: 'ai_predicted',
            description: 'Ventas proyectadas basadas en históricos',
            confidence_score: confidenceFactor
          });
        }
      }
      
      // Process receivables data for this week
      if (historicalData.receivables && historicalData.receivables.length > 0) {
        const avgReceivables = calculateExpectedValue(
          historicalData.receivables.map(rec => rec.amount || 0),
          confidenceFactor
        );
        
        if (avgReceivables > 0) {
          predictedInflows += avgReceivables;
          inflowItems.push({
            category: 'Cuentas por Cobrar',
            amount: avgReceivables,
            type: 'inflow',
            source: 'ai_predicted',
            description: 'Cobros proyectados basados en históricos',
            confidence_score: confidenceFactor
          });
        }
      }
      
      // Calculate expected outflows from expenses and payables
      let predictedOutflows = 0;
      const outflowItems: ForecastItemData[] = [];
      
      // Process expense data for this week
      if (historicalData.expenses && historicalData.expenses.length > 0) {
        const avgWeeklyExpenses = calculateExpectedValue(
          historicalData.expenses.map(exp => exp.amount || 0),
          confidenceFactor
        );
        
        if (avgWeeklyExpenses > 0) {
          predictedOutflows += avgWeeklyExpenses;
          outflowItems.push({
            category: 'Gastos Operativos',
            amount: avgWeeklyExpenses,
            type: 'outflow',
            source: 'ai_predicted',
            description: 'Gastos proyectados basados en históricos',
            confidence_score: confidenceFactor
          });
        }
      }
      
      // Process payables data for this week
      if (historicalData.payables && historicalData.payables.length > 0) {
        const avgPayables = calculateExpectedValue(
          historicalData.payables.map(pay => pay.amount || 0),
          confidenceFactor
        );
        
        if (avgPayables > 0) {
          predictedOutflows += avgPayables;
          outflowItems.push({
            category: 'Cuentas por Pagar',
            amount: avgPayables,
            type: 'outflow',
            source: 'ai_predicted',
            description: 'Pagos proyectados basados en históricos',
            confidence_score: confidenceFactor
          });
        }
      }
      
      // Add fixed costs that occur in specific weeks (examples)
      if (i % 4 === 0) { // Monthly costs (every 4 weeks)
        const rentAmount = 2000;
        predictedOutflows += rentAmount;
        outflowItems.push({
          category: 'Renta',
          amount: rentAmount,
          type: 'outflow',
          source: 'ai_predicted',
          description: 'Pago mensual de renta',
          is_recurring: true,
          confidence_score: 0.9
        });
      }
      
      if (i % 2 === 0) { // Bi-weekly costs (every 2 weeks)
        const payrollAmount = 3000;
        predictedOutflows += payrollAmount;
        outflowItems.push({
          category: 'Nómina',
          amount: payrollAmount,
          type: 'outflow',
          source: 'ai_predicted',
          description: 'Pago quincenal de nómina',
          is_recurring: true,
          confidence_score: 0.95
        });
      }
      
      // Combine all items
      const allItems = [...inflowItems, ...outflowItems];
      
      // Add week to forecast
      forecastWeeks.push({
        weekNumber: i + 1,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        predictedInflows,
        predictedOutflows,
        items: allItems
      });
    }

    // Generate AI insights if OpenAI client is available
    let aiInsights = "";
    if (openai) {
      aiInsights = await generateAIInsights(historicalData, forecastWeeks, openai);
    }

    // Update the forecast in the database
    const { error: updateError } = await supabase
      .from('cash_flow_forecasts')
      .update({
        status: 'active',
        ai_insights: aiInsights
      })
      .eq('id', forecastId);

    if (updateError) {
      console.error('Error updating forecast:', updateError);
      throw new Error('Failed to update forecast status');
    }

    // Insert forecast weeks data
    for (const week of forecastWeeks) {
      // Update week data
      const { data: weekData, error: weekUpdateError } = await supabase
        .from('forecast_weeks')
        .update({
          predicted_inflows: week.predictedInflows,
          predicted_outflows: week.predictedOutflows
        })
        .eq('forecast_id', forecastId)
        .eq('week_number', week.weekNumber)
        .select('id')
        .single();

      if (weekUpdateError) {
        console.error('Error updating forecast week:', weekUpdateError);
        continue;
      }

      // Insert forecast items
      if (week.items.length > 0) {
        // Delete existing AI predicted items for this week
        await supabase
          .from('forecast_items')
          .delete()
          .eq('forecast_id', forecastId)
          .eq('week_id', weekData.id)
          .eq('source', 'ai_predicted');

        // Insert new items
        const forecastItems = week.items.map(item => ({
          forecast_id: forecastId,
          week_id: weekData.id,
          category: item.category,
          amount: item.amount,
          description: item.description || null,
          is_recurring: item.is_recurring || false,
          confidence_score: item.confidence_score || 0.5,
          type: item.type,
          source: item.source
        }));

        const { error: itemsError } = await supabase
          .from('forecast_items')
          .insert(forecastItems);

        if (itemsError) {
          console.error('Error inserting forecast items:', itemsError);
        }
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Forecast generated successfully',
        insights: aiInsights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred'
      }),
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        }, 
        status: 500 
      }
    );
  }
});
