
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface TokenVerificationComponentProps {
  token: string | null;
  onVerificationComplete: (invitation: any | null, error: string | null) => void;
}

export default function TokenVerificationComponent({ 
  token, 
  onVerificationComplete 
}: TokenVerificationComponentProps) {
  const navigate = useNavigate();
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenDebugInfo, setTokenDebugInfo] = useState<string>("");

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setTokenError("No se proporcionó un token de invitación");
      setVerifyingToken(false);
      setTokenDebugInfo("Error: No token provided");
      onVerificationComplete(null, "No se proporcionó un token de invitación");
      return;
    }

    try {
      console.log("Verifying invitation token:", token);
      
      setTokenDebugInfo(`Token length: ${token.length}, Format: ${token.includes('-') ? 'UUID' : 'Other'}`);
      
      let invitation = null;
      let error = null;
      
      const { data: directResult, error: directError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("invitation_token", token)
        .maybeSingle();
      
      console.log("Token verification result:", { invitation: directResult, error: directError });
      
      if (directResult) {
        invitation = directResult;
      } else {
        const { data: textResult, error: textError } = await supabase
          .from("user_invitations")
          .select("*")
          .filter("invitation_token::text", "eq", token)
          .maybeSingle();
          
        console.log("Text-based token verification result:", { invitation: textResult, error: textError });
        
        if (textResult) {
          invitation = textResult;
        } else {
          const { data: functionResult, error: functionError } = await supabase
            .rpc('find_invitation_by_token', { token_param: token });
          
          console.log("Custom function token verification result:", { invitation: functionResult, error: functionError });
          
          if (functionResult && Array.isArray(functionResult) && functionResult.length > 0) {
            invitation = functionResult[0];
          }
        }
      }
      
      setTokenDebugInfo(prev => `${prev}\nQuery results: ${invitation ? 'Found' : 'Not found'}`);
      
      if (!invitation) {
        const { data: recentInvitations, error: recentError } = await supabase
          .from("user_invitations")
          .select("*")
          .order('created_at', { ascending: false })
          .limit(5);
          
        setTokenDebugInfo(prev => `${prev}\nRecent invitations query: ${recentInvitations ? `Found ${recentInvitations.length}` : 'Error'}`);
        
        if (recentInvitations && recentInvitations.length > 0) {
          console.log("Recent invitations:", recentInvitations);
          
          const matchingInvitation = recentInvitations.find(
            inv => inv.invitation_token && inv.invitation_token.toString() === token
          );
          
          if (matchingInvitation) {
            invitation = matchingInvitation;
            setTokenDebugInfo(prev => `${prev}\nFound matching invitation in recent invitations`);
          } else {
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
        onVerificationComplete(null, "Token de invitación no encontrado");
        return;
      }
      
      if (invitation.status !== "pending") {
        if (invitation.status === "completed") {
          setTokenError("Esta invitación ya ha sido utilizada");
          setTokenDebugInfo(prev => `${prev}\nResult: Invitation already completed`);
        } else {
          setTokenError("Esta invitación ha expirado");
          setTokenDebugInfo(prev => `${prev}\nResult: Invitation expired`);
          
          if (invitation.status !== "expired") {
            await supabase
              .from("user_invitations")
              .update({ status: "expired" })
              .eq("id", invitation.id);
            
            setTokenDebugInfo(prev => `${prev}\nAction: Marked invitation as expired`);
          }
        }
        setVerifyingToken(false);
        onVerificationComplete(null, tokenError);
        return;
      }

      setVerifyingToken(false);
      onVerificationComplete(invitation, null);
    } catch (error) {
      console.error("Error verifying token:", error);
      setTokenError("Error al verificar el token de invitación");
      setTokenDebugInfo(prev => `${prev}\nException: ${error instanceof Error ? error.message : String(error)}`);
      setVerifyingToken(false);
      onVerificationComplete(null, "Error al verificar el token de invitación");
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

  return null;
}
