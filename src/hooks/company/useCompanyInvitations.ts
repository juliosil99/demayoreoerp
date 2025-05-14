
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Hook to check user invitation status
 * @param userEmail The email of the user
 * @param userId The ID of the user
 * @returns Status of invitation checking
 */
export function useCompanyInvitations(userEmail: string | undefined, userId: string | undefined) {
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
        
        // If user already has a company, nothing more to do
        if (userCompany) {
          console.log("✅ User has their own company");
          setIsLoading(false);
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
        
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        if (err instanceof Error) {
          console.error("Error details:", {
            message: err.message,
            stack: err.stack
          });
        }
        toast.error("Error al verificar la empresa");
        setIsLoading(false);
      }
    };

    checkInvitationStatus();
  }, [userEmail, userId]);

  return { isLoading };
}
