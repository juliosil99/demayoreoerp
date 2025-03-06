
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const useUserStatus = () => {
  const navigate = useNavigate();

  const checkUserStatus = async (userId: string, userEmail: string) => {
    console.log("useUserStatus: Checking user status for:", { userId, userEmail });
    
    try {
      // First, check if the user has a role
      console.log("useUserStatus: Checking if user has a role...");
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (roleError) {
        console.error("useUserStatus: Error checking user role:", roleError);
        throw roleError;
      }
      
      if (userRole) {
        console.log("useUserStatus: User has role:", userRole.role);
        
        const { data: userCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (companyError) {
          console.error("useUserStatus: Error checking user company:", companyError);
          throw companyError;
        }
        
        if (userCompany) {
          console.log("useUserStatus: User has their own company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        const { data: anyCompany } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
        
        if (anyCompany && anyCompany.length > 0) {
          console.log("useUserStatus: Companies exist, user has role but no company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        } else {
          console.log("useUserStatus: No company found, redirecting to company setup");
          navigate("/company-setup");
          return;
        }
      }
      
      const { data: invitations, error: invitationError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("email", userEmail);
      
      if (invitationError) {
        console.error("useUserStatus: Error checking invitations:", invitationError);
        throw invitationError;
      }
      
      const completedInvitation = invitations?.find(inv => inv.status === 'completed');
      
      if (completedInvitation) {
        console.log("useUserStatus: Found completed invitation but no role, creating role now");
        
        const { error: createRoleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: completedInvitation.role || 'user'
          });
          
        if (createRoleError) {
          console.error("useUserStatus: Error creating role:", createRoleError);
          throw createRoleError;
        }
        
        console.log("useUserStatus: Role created, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }
      
      const pendingInvitation = invitations?.find(inv => inv.status === 'pending');
      
      if (pendingInvitation) {
        console.log("useUserStatus: User has a pending invitation, redirecting to registration");
        navigate(`/register?token=${pendingInvitation.invitation_token}`);
        return;
      }
      
      const expiredInvitation = invitations?.find(inv => inv.status === 'expired');
      
      if (expiredInvitation) {
        console.log("useUserStatus: User has an expired invitation");
        toast.error("Tu invitación ha expirado. Contacta al administrador para que la reactive.");
        return;
      }
      
      const { data: anyCompany } = await supabase
        .from("companies")
        .select("*")
        .limit(1);
      
      if (anyCompany && anyCompany.length > 0) {
        console.log("useUserStatus: Companies exist but none for this user and not invited");
        toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
        return;
      } else {
        console.log("useUserStatus: No company found, redirecting to company setup");
        navigate("/company-setup");
      }
    } catch (err) {
      console.error("useUserStatus: Error in checkUserStatus:", err);
      toast.error("Error verificando el estado del usuario");
    }
  };

  return { checkUserStatus };
};
