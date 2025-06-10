
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await req.json();
    console.log('Received ML question data:', body);

    // Validar datos requeridos
    if (!body.question_id || !body.question_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: question_id, question_text' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparar metadata con todos los datos específicos de ML
    const metadata = {
      platform: 'mercadolibre',
      question_id: body.question_id,
      item_id: body.item_id,
      from_user: body.from_user || body.from_user_id,
      from_user_nickname: body.from_user_nickname,
      product_title: body.product_title,
      product_price: body.product_price,
      classification: body.classification || {},
      urgency_level: body.urgency_level,
      ai_model_used: body.ai_model_used || 'gpt-4o-mini',
      response_time_seconds: body.response_time_seconds,
      response_type: body.response_type,
      ml_status: body.status || 'answered',
      question_date: body.question_date || body.date_created,
      answer_date: body.answer_date || new Date().toISOString(),
      original_question: body.original_question || body.question_text,
      generated_response: body.response_text
    };

    // Insertar en la tabla interactions
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        type: 'mercadolibre_question',
        subject: `Pregunta ML: ${body.question_text.substring(0, 50)}...`,
        description: body.response_text || body.generated_response,
        interaction_date: new Date().toISOString(),
        outcome: body.response_text ? 'Respondida automáticamente' : 'Procesada',
        metadata: metadata,
        // Nota: user_id se puede obtener del contexto o pasarse en el body
        user_id: body.user_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting interaction:', error);
      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully stored ML interaction:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        interaction_id: data.id,
        message: 'ML question stored successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing ML question:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
