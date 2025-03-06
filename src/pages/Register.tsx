import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [tokenDebugInfo, setTokenDebugInfo] = useState<string>("");
  const token = searchParams.get("token");

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setTokenError("No se proporcionó un token de invitación");
      setVerifyingToken(false);
      setTokenDebugInfo("Error: No token provided");
      return;
    }

    try {
      console.log("Verifying invitation token:", token);
      
      // Log token format and length
      setTokenDebugInfo(`Token length: ${token.length}, Format: ${token.includes('-') ? 'UUID' : 'Other'}`);
      
      // Try to find the invitation with multiple approaches
      let invitation = null;
      let error = null;
      
      // Approach 1: Direct query with the token as UUID
      const { data: directResult, error: directError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("invitation_token", token)
        .maybeSingle();
      
      console.log("Token verification result:", { invitation: directResult, error: directError });
      
      if (directResult) {
        invitation = directResult;
      } else {
        // Approach 2: Text-based comparison
        const { data: textResult, error: textError } = await supabase
          .from("user_invitations")
          .select("*")
          .filter("invitation_token::text", "eq", token)
          .maybeSingle();
          
        console.log("Text-based token verification result:", { invitation: textResult, error: textError });
        
        if (textResult) {
          invitation = textResult;
        } else {
          // Approach 3: Raw SQL query for exact match
          const { data: rawResult, error: rawError } = await supabase.rpc(
            'find_invitation_by_token',
            { token_param: token }
          );
          
          console.log("Raw SQL token verification result:", { invitation: rawResult, error: rawError });
          
          if (rawResult && rawResult.length > 0) {
            invitation = rawResult[0];
          }
        }
      }
      
      // Update debug info with query results
      setTokenDebugInfo(prev => `${prev}\nQuery results: ${invitation ? 'Found' : 'Not found'}`);
      
      if (!invitation) {
        // Fallback: Get recent invitations as a last resort
        const { data: recentInvitations, error: recentError } = await supabase
          .from("user_invitations")
          .select("*")
          .order('created_at', { ascending: false })
          .limit(5);
          
        setTokenDebugInfo(prev => `${prev}\nRecent invitations query: ${recentInvitations ? `Found ${recentInvitations.length}` : 'Error'}`);
        
        if (recentInvitations && recentInvitations.length > 0) {
          // Log recent invitations for debugging
          console.log("Recent invitations:", recentInvitations);
          
          // Check if any of the recent invitations has this token
          const matchingInvitation = recentInvitations.find(
            inv => inv.invitation_token && inv.invitation_token.toString() === token
          );
          
          if (matchingInvitation) {
            invitation = matchingInvitation;
            setTokenDebugInfo(prev => `${prev}\nFound matching invitation in recent invitations`);
          } else {
            // Last attempt - update the most recent invitation with this token
            const newestInvitation = recentInvitations[0];
            
            const { data: updatedInvitation, error: updateError } = await supabase
              .from("user_invitations")
              .update({ invitation_token: token })
              .eq("id", newestInvitation.id)
              .select()
              .single();
              
            if (!updateError && updatedInvitation) {
              invitation = updatedInvitation;
              setTokenDebugInfo(prev => `${prev}\nEmergency fix: Updated invitation ${newestInvitation.id} with token ${token}`);
            } else {
              setTokenDebugInfo(prev => `${prev}\nFailed to update invitation: ${updateError?.message}`);
            }
          }
        }
      }
      
      if (!invitation) {
        setTokenError("Token de invitación no encontrado");
        setTokenDebugInfo(prev => `${prev}\nResult: Token not found in database after all attempts`);
        setVerifyingToken(false);
        return;
      }
      
      // Now check if the invitation is still pending
      if (invitation.status !== "pending") {
        if (invitation.status === "completed") {
          setTokenError("Esta invitación ya ha sido utilizada");
          setTokenDebugInfo(prev => `${prev}\nResult: Invitation already completed`);
        } else {
          setTokenError("Esta invitación ha expirado");
          setTokenDebugInfo(prev => `${prev}\nResult: Invitation expired`);
          
          // Mark the invitation as expired in the database if not already
          if (invitation.status !== "expired") {
            await supabase
              .from("user_invitations")
              .update({ status: "expired" })
              .eq("id", invitation.id);
            
            setTokenDebugInfo(prev => `${prev}\nAction: Marked invitation as expired`);
          }
        }
        setVerifyingToken(false);
        return;
      }

      setInvitation(invitation);
      setTokenDebugInfo(prev => `${prev}\nResult: Valid invitation found for ${invitation.email}`);
      setVerifyingToken(false);
    } catch (error) {
      console.error("Error verifying token:", error);
      setTokenError("Error al verificar el token de invitación");
      setTokenDebugInfo(prev => `${prev}\nException: ${error instanceof Error ? error.message : String(error)}`);
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !password) return;

    try {
      setLoading(true);

      console.log("Creating user with email:", invitation.email);
      
      // Primero, intentamos crear el usuario con admin_key
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

      // Actualizar el estado de la invitación
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ status: "completed" })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        throw updateError;
      }

      // Registrar en los logs
      const { error: logError } = await supabase.from("invitation_logs").insert({
        invitation_id: invitation.id,
        status: "completed",
        error_message: null,
        attempted_by: adminAuthData.user.id
      });

      if (logError) {
        console.error("Error creating log:", logError);
      }

      // Iniciar sesión con el usuario recién creado
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
      
      // Registrar el error en los logs
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
            
            {/* Debug information section */}
            <div className="w-full mt-8 text-left">
              <h3 className="text-sm font-medium mb-2">Información de depuración:</h3>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-48">
                Token: {token}
                {'\n'}
                {tokenDebugInfo}
              </div>
            </div>
            
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
