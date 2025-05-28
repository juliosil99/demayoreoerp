import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

interface SimpleInvitationData {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  company_id?: string;
  invited_by: string;
}

interface CompanyData {
  id: string;
  nombre: string;
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [invitation, setInvitation] = useState<SimpleInvitationData | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setTokenError("No se proporcionó un token de invitación");
      setVerifyingToken(false);
      return;
    }

    try {
      console.log("Verifying invitation token:", token);
      
      // Use the existing database function to avoid type issues
      const { data: invitationData, error } = await supabase.rpc('find_invitation_by_token', {
        token_param: token
      });

      console.log("Token verification result:", { invitationData, error });

      if (error) {
        console.error("Error verifying token:", error);
        setTokenError("Error al verificar el token de invitación");
        setVerifyingToken(false);
        return;
      }
      
      if (!invitationData || invitationData.length === 0) {
        setTokenError("Token de invitación no encontrado o inválido");
        setVerifyingToken(false);
        return;
      }
      
      // Get the first invitation from the array
      const rawInvitation = invitationData[0];
      
      // Manually map the raw data to our simple interface
      const mappedInvitation: SimpleInvitationData = {
        id: rawInvitation.id,
        email: rawInvitation.email,
        role: rawInvitation.role,
        status: rawInvitation.status,
        expires_at: rawInvitation.expires_at,
        company_id: rawInvitation.company_id,
        invited_by: rawInvitation.invited_by
      };
      
      // Check if the invitation is still pending
      if (mappedInvitation.status !== "pending") {
        if (mappedInvitation.status === "completed") {
          setTokenError("Esta invitación ya ha sido utilizada");
        } else {
          setTokenError("Esta invitación ha expirado");
        }
        setVerifyingToken(false);
        return;
      }

      // Check if invitation has expired
      const now = new Date();
      const expiresAt = new Date(mappedInvitation.expires_at);
      if (now > expiresAt) {
        setTokenError("Esta invitación ha expirado");
        
        // Mark invitation as expired
        await supabase
          .from("user_invitations")
          .update({ status: "expired" })
          .eq("id", mappedInvitation.id);
        
        setVerifyingToken(false);
        return;
      }

      // Set the invitation data
      setInvitation(mappedInvitation);

      // Fetch company data separately if company_id exists
      if (mappedInvitation.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("nombre")
          .eq("id", mappedInvitation.company_id)
          .single();

        if (!companyError && companyData) {
          setCompanyName(companyData.nombre);
        }
      }

      setVerifyingToken(false);
    } catch (error) {
      console.error("Error verifying token:", error);
      setTokenError("Error al verificar el token de invitación");
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        }
      }

      // Actualizar estado de invitación a completado
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ status: "completed" })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error actualizando estado de invitación:", updateError);
        // No fallar por esto, continuar el proceso
      }

      // Crear log de finalización
      const { error: logError } = await supabase.from("invitation_logs").insert({
        invitation_id: invitation.id,
        status: "completed",
        error_message: null,
        attempted_by: adminAuthData.user.id
      });

      if (logError) {
        console.error("Error creando log:", logError);
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

  if (verifyingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Verificando invitación...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <h1 className="text-2xl font-bold text-red-600">Invitación no válida</h1>
            <p className="text-gray-600">{tokenError}</p>
            
            <Button 
              onClick={() => navigate("/login")} 
              className="mt-4"
            >
              Volver al inicio de sesión
            </Button>
          </div>
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
            Bienvenido {invitation?.email}.
          </p>
          {companyName && (
            <p className="text-sm font-medium">
              Estás siendo invitado a unirte a la empresa: <span className="text-primary">{companyName}</span>
            </p>
          )}
          <p className="text-gray-500 mt-2">
            Por favor, establece tu contraseña para completar el registro.
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
            {loading ? "Procesando..." : "Completar registro"}
          </Button>
        </form>
      </div>
    </div>
  );
}
