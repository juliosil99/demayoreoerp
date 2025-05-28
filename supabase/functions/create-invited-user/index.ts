
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
    console.log(`Procesando usuario: ${email}, rol: ${role}`)

    let user = null
    let isNewUser = false

    // Intentar crear el usuario
    const { data: createData, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    })

    if (createError) {
      // Si el error es que el usuario ya existe
      if (createError.message?.includes('already been registered') || createError.status === 422) {
        console.log(`Usuario ya existe, actualizando contraseña para: ${email}`)
        
        // Obtener el usuario existente
        const { data: existingUsers, error: listError } = await supabaseClient.auth.admin.listUsers()
        
        if (listError) {
          console.error('Error obteniendo usuarios existentes:', listError)
          throw listError
        }

        const existingUser = existingUsers.users.find(u => u.email === email)
        
        if (!existingUser) {
          console.error('Usuario no encontrado después de error de duplicado')
          throw new Error('Usuario no encontrado')
        }

        // Actualizar la contraseña del usuario existente
        const { data: updateData, error: updateError } = await supabaseClient.auth.admin.updateUserById(
          existingUser.id,
          {
            password: password,
            user_metadata: { role }
          }
        )

        if (updateError) {
          console.error('Error actualizando contraseña del usuario:', updateError)
          throw updateError
        }

        user = updateData.user
        console.log(`Contraseña actualizada exitosamente para usuario: ${user.id}`)
      } else {
        console.error('Error creando usuario:', createError)
        throw createError
      }
    } else {
      user = createData.user
      isNewUser = true
      console.log(`Usuario creado exitosamente: ${user.id}`)
    }

    if (!user) {
      console.error('No se pudo obtener el usuario')
      throw new Error('No se pudo procesar el usuario')
    }

    // Actualizar o crear el perfil del usuario con el email
    console.log(`Actualizando perfil para usuario: ${user.id}`)
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error actualizando perfil:', profileError)
      // No fallar por esto, continuar el proceso
    } else {
      console.log('Perfil actualizado exitosamente')
    }

    // Si el rol es admin, asegurar que tenga el rol en user_roles
    if (role === 'admin') {
      console.log(`Asignando rol de admin a: ${user.id}`)
      
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        }, {
          onConflict: 'user_id,role'
        })

      if (roleError) {
        console.error('Error asignando rol de admin:', roleError)
        // No fallar por esto, continuar el proceso
      }
    }

    const responseMessage = isNewUser 
      ? 'Usuario creado exitosamente' 
      : 'Usuario actualizado exitosamente'

    return new Response(
      JSON.stringify({ 
        user,
        message: responseMessage,
        isNewUser
      }),
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
