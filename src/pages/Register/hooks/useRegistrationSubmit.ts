
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SimpleInvitationData {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  company_id?: string;
  invited_by: string;
}

export function useRegistrationSubmit() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (invitation: SimpleInvitationData, password: string) => {
    if (!invitation || !password) return;

    try {
      setLoading(true);

      console.log("🔄 Iniciando proceso de registro para:", invitation.email);
      
      // Paso 1: Crear/actualizar usuario usando la función admin
      console.log("📞 Llamando a función create-invited-user...");
      const { data: adminAuthData, error: adminAuthError } = await supabase.functions.invoke('create-invited-user', {
        body: {
          email: invitation.email,
          password: password,
          role: invitation.role
        }
      });

      if (adminAuthError || !adminAuthData) {
        console.error("❌ Error en función create-invited-user:", adminAuthError || "No data returned");
        throw adminAuthError || new Error("Error al procesar el usuario");
      }

      console.log("✅ Usuario procesado exitosamente:", adminAuthData);

      // Paso 2: Verificar que el usuario tenga perfil con email
      console.log("🔍 Verificando perfil del usuario...");
      const { data: profile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", adminAuthData.user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error("❌ Error verificando perfil:", profileCheckError);
      }

      // Si no tiene email en el perfil, actualizarlo
      if (!profile?.email) {
        console.log("📝 Actualizando email en perfil...");
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .upsert({
            id: adminAuthData.user.id,
            email: invitation.email
          }, {
            onConflict: 'id'
          });

        if (profileUpdateError) {
          console.error("❌ Error actualizando perfil:", profileUpdateError);
        } else {
          console.log("✅ Perfil actualizado con email");
        }
      }

      // Paso 3: Crear relación company_user si la invitación tiene company_id
      if (invitation.company_id) {
        console.log("🏢 Verificando relación empresa-usuario...");
        const { data: existingRelation, error: relationCheckError } = await supabase
          .from("company_users")
          .select("*")
          .eq("user_id", adminAuthData.user.id)
          .eq("company_id", invitation.company_id)
          .maybeSingle();

        if (relationCheckError) {
          console.error("❌ Error verificando relación empresa-usuario:", relationCheckError);
        }

        if (!existingRelation) {
          const { error: relationError } = await supabase
            .from("company_users")
            .insert({
              company_id: invitation.company_id,
              user_id: adminAuthData.user.id,
              role: invitation.role
            });
            
          if (relationError) {
            console.error("❌ Error creando relación empresa-usuario:", relationError);
          } else {
            console.log("✅ Relación empresa-usuario creada exitosamente");
          }
        } else {
          console.log("✅ Relación empresa-usuario ya existe");
        }
      }

      // Paso 4: CRÍTICO - Verificar y actualizar estado de invitación
      console.log("🔍 Verificando estado de invitación...");
      const { data: currentInvitation, error: invitationCheckError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("id", invitation.id)
        .single();

      if (invitationCheckError) {
        console.error("❌ Error verificando invitación:", invitationCheckError);
      }

      if (currentInvitation?.status !== "completed") {
        console.log("🔄 Actualizando estado de invitación a completado...");
        const { error: updateError } = await supabase
          .from("user_invitations")
          .update({ status: "completed" })
          .eq("id", invitation.id);

        if (updateError) {
          console.error("❌ Error actualizando estado de invitación:", updateError);
          // Intentar una vez más
          console.log("🔄 Reintentando actualización de invitación...");
          const { error: retryError } = await supabase
            .from("user_invitations")
            .update({ status: "completed" })
            .eq("id", invitation.id);
          
          if (retryError) {
            console.error("❌ Error en segundo intento:", retryError);
          } else {
            console.log("✅ Invitación actualizada en segundo intento");
          }
        } else {
          console.log("✅ Estado de invitación actualizado a completado");
        }
      } else {
        console.log("✅ Invitación ya estaba marcada como completada");
      }

      // Paso 5: Crear log de finalización exitosa si no existe
      console.log("📝 Verificando log de completado...");
      const { data: existingLog, error: logCheckError } = await supabase
        .from("invitation_logs")
        .select("*")
        .eq("invitation_id", invitation.id)
        .eq("status", "completed")
        .maybeSingle();

      if (logCheckError) {
        console.error("❌ Error verificando log:", logCheckError);
      }

      if (!existingLog) {
        const { error: logError } = await supabase.from("invitation_logs").insert({
          invitation_id: invitation.id,
          status: "completed",
          error_message: null,
          attempted_by: adminAuthData.user.id
        });

        if (logError) {
          console.error("❌ Error creando log de completado:", logError);
        } else {
          console.log("✅ Log de completado creado exitosamente");
        }
      } else {
        console.log("✅ Log de completado ya existe");
      }

      // Paso 6: Iniciar sesión con el usuario
      console.log("🔐 Iniciando sesión...");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: password,
      });

      if (signInError) {
        console.error("❌ Error iniciando sesión:", signInError);
        const message = adminAuthData.isNewUser 
          ? "Usuario creado exitosamente. Por favor, inicia sesión manualmente."
          : "Registro actualizado exitosamente. Por favor, inicia sesión manualmente.";
        toast.success(message);
        navigate("/login");
        return;
      }

      const successMessage = adminAuthData.isNewUser 
        ? "Registro completado exitosamente"
        : "Registro actualizado exitosamente";
      
      console.log("🎉 Proceso de registro completado exitosamente");
      toast.success(successMessage);
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      toast.error(error.message || "Error al completar el registro");
      
      // Crear log de error
      try {
        await supabase.from("invitation_logs").insert({
          invitation_id: invitation.id,
          status: "error",
          error_message: error.message,
          attempted_by: invitation.invited_by
        });
      } catch (logError) {
        console.error("❌ Error creando log de error:", logError);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit
  };
}
