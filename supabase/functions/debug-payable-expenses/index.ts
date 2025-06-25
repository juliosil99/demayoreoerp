
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { payableId } = await req.json()

    // Get detailed information about the payable and related expenses
    const { data: payableData, error: payableError } = await supabaseClient
      .from('accounts_payable')
      .select(`
        *,
        expenses!expense_id (*)
      `)
      .eq('id', payableId)
      .single()

    if (payableError) {
      throw payableError
    }

    // Get all expenses that might be related to this payable
    const { data: relatedExpenses, error: expensesError } = await supabaseClient
      .from('expenses')
      .select('*')
      .or(`description.ilike.%${payableId}%,notes.ilike.%${payableId}%`)

    if (expensesError) {
      console.error('Error fetching related expenses:', expensesError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payable: payableData,
        relatedExpenses: relatedExpenses || [],
        debugInfo: {
          hasLinkedExpense: !!payableData.expense_id,
          linkedExpenseId: payableData.expense_id,
          potentialDuplicates: relatedExpenses?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
