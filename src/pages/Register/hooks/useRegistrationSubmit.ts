
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

      console.log("Procesando registro para usuario:", invitation.email);
      
      // Crear/actualizar usuario usando la función admin
      const { data: adminAuthData, error: adminAuthError } = await supabase.functions.invoke('create-invited-user', {
        body: {
          email: invitation.email,
          password: password,
          role: invitation.role
        }
      });

      if (adminAuthError || !adminAuthData) {
        console.error("Error procesando usuario:", adminAuthError || "No data returned");
        throw adminAuthError || new Error("Error al procesar el usuario");
      }

      console.log("Usuario procesado exitosamente:", adminAuthData);

      // Crear relación company_user si la invitación tiene company_id
      if (invitation.company_id) {
        const { error: relationError } = await supabase
          .from("company_users")
          .upsert({
            company_id: invitation.company_id,
            user_id: adminAuthData.user.id,
            role: invitation.role
          }, {
            onConflict: 'user_id,company_id'
          });
          
        if (relationError) {
          console.error("Error creando/actualizando relación empresa-usuario:", relationError);
          // No fallar por esto, continuar el proceso
        } else {
          console.log("Relación empresa-usuario creada/actualizada exitosamente");
        }
      }

      // CRÍTICO: Actualizar estado de invitación a completado
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ status: "completed" })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error actualizando estado de invitación:", updateError);
        // No fallar por esto, pero es importante para la sincronización
      } else {
        console.log("Estado de invitación actualizado a completado");
      }

      // Crear log de finalización exitosa
      const { error: logError } = await supabase.from("invitation_logs").insert({
        invitation_id: invitation.id,
        status: "completed",
        error_message: null,
        attempted_by: adminAuthData.user.id
      });

      if (logError) {
        console.error("Error creando log de completado:", logError);
      } else {
        console.log("Log de completado creado exitosamente");
      }

      // Iniciar sesión con el usuario
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: password,
      });

      if (signInError) {
        console.error("Error iniciando sesión:", signInError);
        const message = adminAuthData.isNewUser 
          ? "Usuario creado exitosamente. Por favor, inicia sesión manualmente."
          : "Contraseña actualizada exitosamente. Por favor, inicia sesión manualmente.";
        toast.success(message);
        navigate("/login");
        return;
      }

      const successMessage = adminAuthData.isNewUser 
        ? "Registro completado exitosamente"
        : "Registro actualizado exitosamente";
      
      toast.success(successMessage);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error en registro:", error);
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
        console.error("Error creando log de error:", logError);
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
