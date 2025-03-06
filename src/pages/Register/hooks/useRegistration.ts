
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function useRegistration(invitation: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (password: string) => {
    if (!invitation || !password) return;

    try {
      setLoading(true);

      console.log("Creating user with email:", invitation.email);
      
      // Get the Supabase URL from environment or config
      // Instead of accessing protected property directly
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dulmmxtkgqkcfovvfxzu.supabase.co";
      
      console.log("Using Supabase URL:", supabaseUrl);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-invited-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
          },
          body: JSON.stringify({
            email: invitation.email,
            password: password,
            role: invitation.role
          })
        }
      );
      
      console.log("Edge function response status:", response.status);
      
      const responseText = await response.text();
      console.log("Edge function raw response:", responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Error en la respuesta del servidor: Formato inválido");
      }
      
      if (!response.ok) {
        console.error("Error response from Edge Function:", responseData);
        
        if (responseData.code === "USER_EXISTS") {
          console.log("User already exists, attempting to sign in instead");
          
          await supabase
            .from("user_invitations")
            .update({ status: "completed" })
            .eq("id", invitation.id);
            
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: invitation.email,
            password: password,
          });
          
          if (signInError) {
            throw new Error("Esta cuenta ya existe pero la contraseña es incorrecta");
          } else {
            toast.success("Inicio de sesión exitoso con cuenta existente");
            navigate("/dashboard");
            return;
          }
        }
        
        throw new Error(responseData.error || "Error al crear el usuario");
      }
      
      console.log("User created successfully:", responseData);

      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ status: "completed" })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        throw updateError;
      }

      const { error: logError } = await supabase.from("invitation_logs").insert({
        invitation_id: invitation.id,
        status: "completed",
        error_message: null,
        attempted_by: responseData.user.id
      });

      if (logError) {
        console.error("Error creating log:", logError);
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: password,
      });

      if (signInError) {
        console.error("Error signing in:", signInError);
        toast.error("Usuario creado pero hubo un error al iniciar sesión. Por favor, inicia sesión manualmente.");
        navigate("/login");
        return;
      }

      toast.success("Registro completado exitosamente");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error in registration:", error);
      toast.error(error.message || "Error al completar el registro");
      
      try {
        await supabase.from("invitation_logs").insert({
          invitation_id: invitation.id,
          status: "error",
          error_message: error.message,
          attempted_by: invitation.invited_by
        });
      } catch (logError) {
        console.error("Error creating error log:", logError);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleRegistration
  };
}
