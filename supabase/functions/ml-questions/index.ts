
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

    const userId = body.user_id;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar o crear empresa para el cliente de MercadoLibre
    let companyId = null;
    const clientNickname = body.from_user_nickname || `Cliente ${body.from_user || body.from_user_id}`;
    
    // Buscar si ya existe una empresa con este nickname
    const { data: existingCompany, error: searchError } = await supabase
      .from('companies_crm')
      .select('id')
      .eq('user_id', userId)
      .eq('name', clientNickname)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Error searching for existing company:', searchError);
    }

    if (existingCompany) {
      companyId = existingCompany.id;
      console.log('Found existing company:', companyId);
    } else {
      // Crear nueva empresa para este cliente de MercadoLibre
      const { data: newCompany, error: companyError } = await supabase
        .from('companies_crm')
        .insert({
          user_id: userId,
          name: clientNickname,
          industry: 'E-commerce',
          description: `Cliente de MercadoLibre - Usuario: ${body.from_user || body.from_user_id}`,
          status: 'customer',
          engagement_score: 50
        })
        .select('id')
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
      } else {
        companyId = newCompany.id;
        console.log('Created new company:', companyId);
      }
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
        user_id: userId,
        company_id: companyId
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
        company_id: companyId,
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
