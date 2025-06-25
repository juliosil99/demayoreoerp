
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

    console.log('🔍 Enhanced debug function called for payable:', payableId)

    // Get detailed information about the payable and related expenses
    const { data: payableData, error: payableError } = await supabaseClient
      .from('accounts_payable')
      .select(`
        *,
        expenses!expense_id (*),
        client:contacts(name, rfc),
        invoice:invoices(invoice_number, invoice_date)
      `)
      .eq('id', payableId)
      .single()

    if (payableError) {
      console.error('Enhanced debug - payable error:', payableError)
      throw payableError
    }

    // Get all expenses that might be related to this payable with enhanced search
    const { data: relatedExpenses, error: expensesError } = await supabaseClient
      .from('expenses')
      .select('*')
      .or(`description.ilike.%${payableId}%,notes.ilike.%${payableId}%`)

    if (expensesError) {
      console.error('Enhanced debug - related expenses error:', expensesError)
    }

    // Get expenses with same supplier and amount (potential duplicates)
    const { data: potentialDuplicates, error: duplicatesError } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('supplier_id', payableData.client_id)
      .eq('amount', payableData.amount)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 7 days

    if (duplicatesError) {
      console.error('Enhanced debug - duplicates error:', duplicatesError)
    }

    // Check for any duplicate expenses using the view
    const { data: duplicateExpensesView, error: viewError } = await supabaseClient
      .from('duplicate_expenses_view')
      .select('*')
      .limit(10)

    if (viewError) {
      console.error('Enhanced debug - view error:', viewError)
    }

    const debugResults = {
      success: true,
      payable: payableData,
      relatedExpenses: relatedExpenses || [],
      potentialDuplicates: potentialDuplicates || [],
      duplicateExpensesView: duplicateExpensesView || [],
      debugInfo: {
        hasLinkedExpense: !!payableData.expense_id,
        linkedExpenseId: payableData.expense_id,
        relatedExpensesCount: relatedExpenses?.length || 0,
        potentialDuplicatesCount: potentialDuplicates?.length || 0,
        systemDuplicatesCount: duplicateExpensesView?.length || 0,
        payableStatus: payableData.status,
        clientInfo: payableData.client,
        invoiceInfo: payableData.invoice
      }
    }

    console.log('✅ Enhanced debug results:', debugResults.debugInfo)

    return new Response(
      JSON.stringify(debugResults),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Enhanced debug error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
