
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CompanyData {
  id?: string;
  nombre: string;
  rfc: string;
  codigo_postal: string;
  regimen_fiscal: string;
}

export async function checkRFCExists(rfc: string): Promise<boolean> {
  console.log("🔍 Checking if RFC exists:", rfc);
  
  const { data, error } = await supabase
    .from("companies")
    .select("rfc")
    .eq("rfc", rfc)
    .maybeSingle();

  if (error) {
    console.error("❌ Error checking RFC:", error);
    return false;
  }

  console.log("✅ RFC check result:", data);
  return data !== null;
}

export function useCompanyData(userId: string | undefined, isEditMode: boolean) {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      console.log("🔍 Starting loadCompanyData...");
      console.log("Current userId:", userId);
      console.log("isEditMode:", isEditMode);

      if (!userId) {
        console.log("❌ No userId found, redirecting to login");
        navigate("/login");
        return;
      }
      
      try {
        // First, check for companies this user has access to
        console.log("🔍 Checking for companies user has access to...");
        const { data: accessibleCompanies, error: accessError } = await supabase
          .from("company_users")
          .select(`
            company:company_id (
              id,
              nombre,
              rfc,
              codigo_postal,
              regimen_fiscal
            )
          `)
          .eq("user_id", userId);
        
        if (accessError) {
          console.error("❌ Error checking company access:", accessError);
          toast.error("Error al verificar acceso a empresas");
          return;
        }
        
        console.log("Companies user has access to:", accessibleCompanies);
        
        const companies = accessibleCompanies
          ?.map(item => item.company)
          .filter(Boolean) || [];
        
        setUserCompanies(companies);
        
        if (companies.length > 0) {
          // User has access to at least one company
          if (isEditMode) {
            // If in edit mode, load the specific company data
            console.log("📝 Edit mode detected, fetching company for user:", userId);
            
            const { data, error } = await supabase
              .from("companies")
              .select("*")
              .eq("id", companies[0].id)  // Default to first company
              .maybeSingle();

            console.log("Query response - data:", data);
            console.log("Query response - error:", error);

            if (error) {
              console.error("❌ Error checking user company:", error);
              toast.error("Error al verificar la empresa");
              setIsLoading(false);
              return;
            }
            
            if (!data) {
              console.log("ℹ️ No company found for editing");
              navigate("/company-setup");
              return;
            }
            
            console.log("✅ Company found for editing:", data);
            setIsEditing(true);
            setCompanyData(data);
            setSelectedCompanyId(data.id);
            setIsLoading(false);
            return;
          } else {
            // If not in edit mode, redirect to dashboard since user already has company access
            console.log("✅ User has company access, redirecting to dashboard");
            navigate("/dashboard");
            return;
          }
        }
        
        // Check if user is an invited user
        console.log("🔍 Checking if user was invited...");
        const userResponse = await supabase.auth.getUser();
        const userEmail = userResponse.data.user?.email;
        console.log("Current user email:", userEmail);
        
        if (!userEmail) {
          console.log("❌ No user email found");
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
          toast.error("Error al verificar estado de invitación");
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
        
        // Check if ANY company exists in the system
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
        
        console.log("Any company check result:", anyCompany);
        
        if (anyCompanyError) {
          console.error("❌ Error checking for any company:", anyCompanyError);
          toast.error("Error al verificar empresas existentes");
        }
        
        if (anyCompany && anyCompany.length > 0) {
          console.log("✅ Company exists in the system, but user has no access");
          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          navigate("/login");
          return;
        }
        
        console.log("ℹ️ No company found, staying on setup page");
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Unexpected error:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack
          });
        }
        toast.error("Error al verificar la empresa");
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [userId, navigate, isEditMode]);

  return { 
    companyData, 
    isLoading, 
    isEditing,
    userCompanies,
    selectedCompanyId,
    setSelectedCompanyId
  };
}
