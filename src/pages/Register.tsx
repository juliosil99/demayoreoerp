
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      toast.error("Token de invitación no válido");
      navigate("/");
      return;
    }

    try {
      const { data: invitation, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("invitation_token", token)
        .eq("status", "pending")
        .single();

      if (error || !invitation) {
        toast.error("Token de invitación no válido o expirado");
        navigate("/");
        return;
      }

      setInvitation(invitation);
    } catch (error) {
      console.error("Error verifying token:", error);
      toast.error("Error al verificar el token de invitación");
      navigate("/");
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !password) return;

    try {
      setLoading(true);

      // Registrar al usuario con Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("No se pudo crear el usuario");

      // Actualizar el estado de la invitación
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ status: "completed" })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // Registrar en los logs
      const { error: logError } = await supabase.from("invitation_logs").insert({
        status: "completed",
        error_message: null,
        attempted_by: signUpData.user.id,
        id: invitation.id
      });

      if (logError) {
        console.error("Error creating log:", logError);
      }

      toast.success("Registro completado exitosamente");
      navigate("/login");
    } catch (error: any) {
      console.error("Error in registration:", error);
      toast.error(error.message || "Error al completar el registro");
      
      // Obtener el usuario actual para el log de error
      const { data: { session } } = await supabase.auth.getSession();
      
      // Registrar el error en los logs
      const { error: logError } = await supabase.from("invitation_logs").insert({
        status: "error",
        error_message: error.message,
        attempted_by: session?.user.id || invitation.invited_by, // Usar invited_by como fallback
        id: invitation.id
      });

      if (logError) {
        console.error("Error creating error log:", logError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Verificando invitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Completa tu registro</h1>
          <p className="text-gray-500">
            Bienvenido {invitation?.email}. Por favor, establece tu contraseña para completar el registro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Completar registro"}
          </Button>
        </form>
      </div>
    </div>
  );
}
