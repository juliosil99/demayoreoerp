
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, role } = await req.json()

    // Primero creamos el usuario con confirmed_at ya establecido
    const { data: { user }, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
      app_metadata: {
        email_confirmed_at: new Date().toISOString(),
        email_confirm_sent_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
      }
    })

    if (createError) throw createError
    if (!user) throw new Error('No se pudo crear el usuario')

    // Forzar la confirmación usando updateUserById
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true,
        app_metadata: {
          email_confirmed_at: new Date().toISOString(),
          email_confirm_sent_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString()
        }
      }
    )

    if (updateError) throw updateError

    if (role === 'admin') {
      // Si el rol es admin, insertamos en user_roles
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })

      if (roleError) throw roleError
    }

    return new Response(
      JSON.stringify({ user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in create-invited-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
