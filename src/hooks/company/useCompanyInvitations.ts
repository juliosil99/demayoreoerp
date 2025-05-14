
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Hook to check user invitation status
 * @param userEmail The email of the user
 * @param userId The ID of the user
 * @returns Status of invitation checking
 */
export function useCompanyInvitations(userEmail: string | undefined, userId: string | undefined) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkInvitationStatus = async () => {
      if (!userEmail || !userId) {
        console.log("❌ No user email or ID found");
        setIsLoading(false);
        return;
      }
      
      console.log("🔍 Checking invitation status for email:", userEmail);
      
      try {
        // Check if user has a company
        const { data: userCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
          
        console.log("User company check result:", userCompany);
        
        if (companyError) {
          console.error("❌ Error checking user company:", companyError);
          throw companyError;
        }
        
        if (userCompany) {
          console.log("✅ User has their own company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Get ALL invitations for this email
        const { data: invitations, error: invitationError } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("email", userEmail);
        
        console.log("All invitations for user:", invitations);
        
        if (invitationError) {
          console.error("❌ Error checking user invitations:", invitationError);
          throw invitationError;
        }
        
        // Check for completed invitations
        const completedInvitation = invitations?.find(inv => inv.status === 'completed');
        
        if (completedInvitation) {
          console.log("✅ User has a completed invitation, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Check for pending invitations
        const pendingInvitation = invitations?.find(inv => inv.status === 'pending');
        
        if (pendingInvitation) {
          console.log("🔍 User has a pending invitation, redirecting to registration");
          navigate(`/register?token=${pendingInvitation.invitation_token}`);
          return;
        }
        
        // Check for expired invitations
        const expiredInvitation = invitations?.find(inv => inv.status === 'expired');
        
        if (expiredInvitation) {
          console.log("⚠️ User has an expired invitation");
          toast.error("Tu invitación ha expirado. Contacta al administrador para que la reactive.");
        }
        
        // Check if any company exists
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
        
        console.log("Any company check result:", anyCompany);
        
        if (anyCompanyError) {
          console.error("❌ Error checking for any company:", anyCompanyError);
          throw anyCompanyError;
        }
        
        if (anyCompany && anyCompany.length > 0) {
          console.log("✅ Company exists in the system, but user has no access");
          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          navigate("/login");
          return;
        }
        
        console.log("ℹ️ No company found, staying on setup page");
      } catch (error) {
        console.error("❌ Unexpected error:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack
          });
        }
        toast.error("Error al verificar la empresa");
      } finally {
        setIsLoading(false);
      }
    };

    checkInvitationStatus();
  }, [userEmail, userId, navigate]);

  return { isLoading };
}
