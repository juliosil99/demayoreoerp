
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

interface CompanyData {
  id: string;
  nombre: string;
}

export function useTokenVerification() {
  const [searchParams] = useSearchParams();
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [invitation, setInvitation] = useState<SimpleInvitationData | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
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

  return {
    verifyingToken,
    invitation,
    companyName,
    tokenError,
    token
  };
}
