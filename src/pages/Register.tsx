
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
      
      // Using explicit any type to avoid TypeScript inference issues
      const { data: rawInvitationData, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("invitation_token::text", token) as { data: any, error: any };

      console.log("Token verification result:", { rawInvitationData, error });

      if (error) {
        console.error("Error verifying token:", error);
        setTokenError("Error al verificar el token de invitación");
        setVerifyingToken(false);
        return;
      }
      
      if (!rawInvitationData) {
        setTokenError("Token de invitación no encontrado o inválido");
        setVerifyingToken(false);
        return;
      }
      
      // Manually map the raw data to our simple interface
      const invitationData: SimpleInvitationData = {
        id: rawInvitationData.id,
        email: rawInvitationData.email,
        role: rawInvitationData.role,
        status: rawInvitationData.status,
        expires_at: rawInvitationData.expires_at,
        company_id: rawInvitationData.company_id,
        invited_by: rawInvitationData.invited_by
      };
      
      // Check if the invitation is still pending
      if (invitationData.status !== "pending") {
        if (invitationData.status === "completed") {
          setTokenError("Esta invitación ya ha sido utilizada");
        } else {
          setTokenError("Esta invitación ha expirado");
        }
        setVerifyingToken(false);
        return;
      }

      // Check if invitation has expired
      const now = new Date();
      const expiresAt = new Date(invitationData.expires_at);
      if (now > expiresAt) {
        setTokenError("Esta invitación ha expirado");
        
        // Mark invitation as expired
        await supabase
          .from("user_invitations")
          .update({ status: "expired" })
          .eq("id", invitationData.id);
        
        setVerifyingToken(false);
        return;
      }

      // Set the invitation data
      setInvitation(invitationData);

      // Fetch company data separately if company_id exists
      if (invitationData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("nombre")
          .eq("id", invitationData.company_id) as { data: any, error: any };

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

      console.log("Creating user with email:", invitation.email);
      
      // Create user using admin function
      const { data: adminAuthData, error: adminAuthError } = await supabase.functions.invoke('create-invited-user', {
        body: {
          email: invitation.email,
          password: password,
          role: invitation.role
        }
      });

      if (adminAuthError || !adminAuthData) {
        console.error("Error creating user:", adminAuthError || "No data returned");
        throw adminAuthError || new Error("Error al crear el usuario");
      }

      console.log("User created successfully:", adminAuthData);

      // Create company_user relationship if invitation has company_id
      if (invitation.company_id) {
        const { error: relationError } = await supabase
          .from("company_users")
          .insert({
            company_id: invitation.company_id,
            user_id: adminAuthData.user.id,
            role: invitation.role
          });
          
        if (relationError) {
          console.error("Error creating company-user relationship:", relationError);
          throw relationError;
        }
      }

      // Update invitation status to completed
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ status: "completed" })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        throw updateError;
      }

      // Log the completion
      const { error: logError } = await supabase.from("invitation_logs").insert({
        invitation_id: invitation.id,
        status: "completed",
        error_message: null,
        attempted_by: adminAuthData.user.id
      });

      if (logError) {
        console.error("Error creating log:", logError);
      }

      // Sign in the newly created user
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
      
      // Log the error
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
            {loading ? "Registrando..." : "Completar registro"}
          </Button>
        </form>
      </div>
    </div>
  );
}
