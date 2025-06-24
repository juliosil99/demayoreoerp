
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { metric, period } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Intentar obtener métricas reales de Analytics de Supabase
    let analyticsData = null;

    try {
      // Aquí se haría la llamada real a la API de Analytics de Supabase
      // Por ahora, estimamos basado en el tamaño real de datos en la DB
      
      const { count: totalInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      const { count: totalSales } = await supabase
        .from('Sales')
        .select('*', { count: 'exact', head: true });

      const { count: totalExpenses } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true });

      // Estimar el Egress basado en el número de registros y tamaño promedio real
      // Estos valores son más conservadores y realistas
      const avgInvoiceSize = 2000; // bytes por factura (sin xml_content)
      const avgSaleSize = 800; // bytes por venta
      const avgExpenseSize = 600; // bytes por gasto

      const estimatedDbSize = (
        (totalInvoices || 0) * avgInvoiceSize +
        (totalSales || 0) * avgSaleSize +
        (totalExpenses || 0) * avgExpenseSize
      );

      analyticsData = {
        egress_bytes_today: Math.floor(estimatedDbSize * 0.05), // 5% del total como uso diario conservador
        total_egress: estimatedDbSize,
        period: period,
        timestamp: new Date().toISOString(),
        source: 'estimated_from_db_size',
        note: 'Estimación basada en tamaño real de datos en DB (sin xml_content)',
        breakdown: {
          invoices: {
            count: totalInvoices || 0,
            estimated_bytes: (totalInvoices || 0) * avgInvoiceSize
          },
          sales: {
            count: totalSales || 0,
            estimated_bytes: (totalSales || 0) * avgSaleSize
          },
          expenses: {
            count: totalExpenses || 0,
            estimated_bytes: (totalExpenses || 0) * avgExpenseSize
          }
        }
      };

      console.log('📊 Analytics data estimated from real DB size:', analyticsData);

    } catch (analyticsError) {
      console.error('Error estimating analytics:', analyticsError);
      
      // Fallback mínimo sin datos hardcodeados
      analyticsData = {
        egress_bytes_today: 0,
        total_egress: 0,
        period: period,
        timestamp: new Date().toISOString(),
        source: 'fallback_no_data',
        note: 'No se pudieron obtener datos reales. Use el monitor local para medición precisa.'
      };
    }

    return new Response(
      JSON.stringify(analyticsData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in get-analytics function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback_data: {
          egress_bytes_today: 0,
          total_egress: 0,
          source: 'error_fallback',
          note: 'Error al obtener datos. Use el monitor local HTTP para medición real.'
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  }
})
