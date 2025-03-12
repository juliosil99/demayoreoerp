
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
    console.log(`Creando usuario invitado: ${email}, rol: ${role}`)

    // Primero creamos el usuario con email_confirm: true
    const { data: { user }, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    })

    if (createError) {
      console.error('Error creando usuario:', createError)
      throw createError
    }
    
    if (!user) {
      console.error('No se pudo crear el usuario, no se devolvió user')
      throw new Error('No se pudo crear el usuario')
    }

    console.log(`Usuario creado exitosamente: ${user.id}`)

    // Si el rol es admin, insertamos en user_roles
    if (role === 'admin') {
      console.log(`Asignando rol de admin a: ${user.id}`)
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })

      if (roleError) {
        console.error('Error asignando rol de admin:', roleError)
        throw roleError
      }
    }

    return new Response(
      JSON.stringify({ user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error en create-invited-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
