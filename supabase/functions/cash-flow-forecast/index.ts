
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

// Define types for the API
interface ForecastRequestBody {
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

interface ForecastWeek {
  id?: string;
  forecast_id: string;
  week_number: number;
  week_start_date: string;
  week_end_date: string;
  predicted_inflows: number;
  predicted_outflows: number;
  actual_inflows?: number;
  actual_outflows?: number;
  notes?: string;
  confidence_score?: number;
}

interface ForecastResponse {
  success: boolean;
  forecast?: ForecastWeek[];
  insights?: string;
  error?: string;
}

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const requestData: ForecastRequestBody = await req.json()
    const { forecastId, startDate, historicalData, config } = requestData
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Initialize OpenAI client
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    
    const configuration = new Configuration({ apiKey: openaiApiKey })
    const openai = new OpenAIApi(configuration)

    // Prepare the data for the cash flow forecast
    const { payables, receivables, expenses, sales, bankAccounts } = historicalData

    // Analyze historical data to generate forecast
    console.log(`Generating forecast for id ${forecastId} starting on ${startDate}`)
    console.log(`Historical data counts: Payables: ${payables.length}, Receivables: ${receivables.length}, Expenses: ${expenses.length}, Sales: ${sales.length}`)

    // Initialize weeks data
    // Each week is 7 days from the start date
    const weeks: ForecastWeek[] = []
    const startDateObj = new Date(startDate)

    for (let i = 0; i < 13; i++) {
      const weekStartDate = new Date(startDateObj)
      weekStartDate.setDate(startDateObj.getDate() + (i * 7))
      
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)
      
      weeks.push({
        forecast_id: forecastId,
        week_number: i + 1,
        week_start_date: weekStartDate.toISOString().split('T')[0],
        week_end_date: weekEndDate.toISOString().split('T')[0],
        predicted_inflows: 0,
        predicted_outflows: 0,
        confidence_score: 0.7
      })
    }

    // Generate the forecast based on historical data
    // This is a simplified model that could be enhanced with more sophisticated analysis
    let forecastInsights = ''

    // Process payables (upcoming payments)
    for (const payable of payables) {
      if (payable.status === 'pending') {
        const dueDate = new Date(payable.due_date)
        
        // Find the week this payable is due
        const weekIndex = weeks.findIndex(week => {
          const weekStart = new Date(week.week_start_date)
          const weekEnd = new Date(week.week_end_date)
          return dueDate >= weekStart && dueDate <= weekEnd
        })
        
        if (weekIndex !== -1) {
          weeks[weekIndex].predicted_outflows += Number(payable.amount)
        }
      }
    }

    // Process receivables (upcoming income)
    for (const receivable of receivables) {
      if (receivable.status === 'pending') {
        // Assume receivables will be received within the next 4 weeks
        // Distribution: 20% week 1, 40% week 2, 30% week 3, 10% week 4
        const amount = Number(receivable.amount)
        
        if (weeks.length >= 4) {
          weeks[0].predicted_inflows += amount * 0.2
          weeks[1].predicted_inflows += amount * 0.4
          weeks[2].predicted_inflows += amount * 0.3
          weeks[3].predicted_inflows += amount * 0.1
        }
      }
    }

    // Process historical sales for recurring patterns
    if (sales.length > 0) {
      // Group sales by week
      const salesByWeek = new Map<number, number>()
      for (const sale of sales) {
        const saleDate = new Date(sale.date)
        const weekNumber = Math.floor((saleDate.getTime() - startDateObj.getTime()) / (7 * 24 * 60 * 60 * 1000))
        
        if (weekNumber >= 0 && weekNumber < 13) {
          const amount = Number(sale.price || 0)
          salesByWeek.set(weekNumber, (salesByWeek.get(weekNumber) || 0) + amount)
        }
      }
      
      // Calculate weekly average sales
      const totalSales = Array.from(salesByWeek.values()).reduce((sum, val) => sum + val, 0)
      const avgWeeklySales = totalSales / Math.max(salesByWeek.size, 1)
      
      // Apply average sales to future weeks
      for (let i = 0; i < Math.min(13, weeks.length); i++) {
        // Add some randomness to simulate real-world variability
        const randomFactor = 0.8 + Math.random() * 0.4 // between 0.8 and 1.2
        weeks[i].predicted_inflows += avgWeeklySales * randomFactor
      }
    }

    // Process historical expenses for recurring patterns
    if (expenses.length > 0) {
      // Group expenses by week
      const expensesByWeek = new Map<number, number>()
      for (const expense of expenses) {
        const expenseDate = new Date(expense.date)
        const weekNumber = Math.floor((expenseDate.getTime() - startDateObj.getTime()) / (7 * 24 * 60 * 60 * 1000))
        
        if (weekNumber >= 0 && weekNumber < 13) {
          const amount = Number(expense.amount || 0)
          expensesByWeek.set(weekNumber, (expensesByWeek.get(weekNumber) || 0) + amount)
        }
      }
      
      // Calculate weekly average expenses
      const totalExpenses = Array.from(expensesByWeek.values()).reduce((sum, val) => sum + val, 0)
      const avgWeeklyExpenses = totalExpenses / Math.max(expensesByWeek.size, 1)
      
      // Apply average expenses to future weeks
      for (let i = 0; i < Math.min(13, weeks.length); i++) {
        // Add some randomness to simulate real-world variability
        const randomFactor = 0.9 + Math.random() * 0.2 // between 0.9 and 1.1
        weeks[i].predicted_outflows += avgWeeklyExpenses * randomFactor
      }
    }

    // Add predictable recurring expense patterns
    // Example: Rent or subscription services that occur at specific periods
    const monthlyRecurringExpenses = 2000 // Example value
    for (let i = 0; i < weeks.length; i++) {
      const weekNumber = i + 1
      // Add monthly expenses in the first week of each month
      if (weekNumber % 4 === 1) {
        weeks[i].predicted_outflows += monthlyRecurringExpenses
      }
    }

    // Round numbers to make them cleaner
    for (const week of weeks) {
      week.predicted_inflows = Math.round(week.predicted_inflows)
      week.predicted_outflows = Math.round(week.predicted_outflows)
    }

    // Use OpenAI to generate insights
    const netCashFlows = weeks.map(week => week.predicted_inflows - week.predicted_outflows)
    let cumulativeCashFlow = 0
    const cumulativeCashFlows = netCashFlows.map(flow => {
      cumulativeCashFlow += flow
      return cumulativeCashFlow
    })

    const weeksSummary = weeks.map((week, index) => {
      return {
        weekNumber: week.week_number,
        startDate: week.week_start_date,
        endDate: week.week_end_date,
        inflows: week.predicted_inflows,
        outflows: week.predicted_outflows,
        netCashFlow: netCashFlows[index],
        cumulativeCashFlow: cumulativeCashFlows[index]
      }
    })

    // Generate AI insights
    const prompt = `
      You are a financial advisor analyzing a 13-week cash flow forecast.
      Please provide insights on the following cash flow forecast data. 
      This is a week-by-week summary of predicted cash inflows and outflows:
      
      ${JSON.stringify(weeksSummary, null, 2)}
      
      Based on this data, please provide:
      
      1. Analysis of Cash Flow Trend: Is the overall trend positive or negative?
      2. Weeks with Potential Cash Flow Issues: Identify specific weeks where cash flow might be tight.
      3. Cash Flow Patterns: Identify any notable patterns in the cash flow data.
      4. Cash Flow Optimization Suggestions: Provide recommendations for improving cash flow.
      5. Risks and Opportunities: What are the main risks and opportunities based on this forecast?
      
      Format your response in clear sections with bullet points where appropriate. Be concise but thorough.
    `

    const openaiResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.7,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })

    forecastInsights = openaiResponse.data.choices[0].text?.trim() || ''

    // Update the database with the forecast and insights
    // First update the weeks
    for (const week of weeks) {
      const { error: weekError } = await supabase
        .from('forecast_weeks')
        .update({
          predicted_inflows: week.predicted_inflows,
          predicted_outflows: week.predicted_outflows,
          confidence_score: week.confidence_score
        })
        .eq('forecast_id', forecastId)
        .eq('week_number', week.week_number)
      
      if (weekError) {
        console.error('Error updating forecast week:', weekError)
        throw new Error(`Failed to update forecast week ${week.week_number}: ${weekError.message}`)
      }
    }

    // Update the forecast with AI insights
    const { error: forecastError } = await supabase
      .from('cash_flow_forecasts')
      .update({
        ai_insights: forecastInsights,
        status: 'active'
      })
      .eq('id', forecastId)
    
    if (forecastError) {
      console.error('Error updating forecast insights:', forecastError)
      throw new Error(`Failed to update forecast insights: ${forecastError.message}`)
    }

    const response: ForecastResponse = {
      success: true,
      forecast: weeks,
      insights: forecastInsights
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in cash-flow-forecast function:', error)
    
    const errorResponse: ForecastResponse = {
      success: false,
      error: error.message || 'An unknown error occurred'
    }
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
