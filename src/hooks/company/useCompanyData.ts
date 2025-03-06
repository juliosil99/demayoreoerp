
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CompanyData {
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
        if (isEditMode) {
          console.log("📝 Edit mode detected, fetching company for user:", userId);
          
          const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          console.log("Query response - data:", data);
          console.log("Query response - error:", error);

          if (!data) {
            console.log("ℹ️ No company found for user");
            navigate("/company-setup");
            return;
          } else if (error) {
            console.error("❌ Error checking user company:", error);
            console.error("Error details:", {
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            toast.error("Error al verificar la empresa");
            setIsLoading(false);
            return;
          }
          
          console.log("✅ Company found for user:", data);
          setIsEditing(true);
          setCompanyData(data);
          setIsLoading(false);
          return;
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
        
        // Check for ANY invitation (pending or completed)
        const { data: anyInvitation, error: invitationError } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("email", userEmail)
          .maybeSingle();
        
        console.log("Any invitation found:", anyInvitation);
        
        if (invitationError) {
          console.error("❌ Error checking user invitation:", invitationError);
          console.error("Error details:", {
            message: invitationError.message,
            details: invitationError.details,
            hint: invitationError.hint
          });
        }
        
        // User was invited (completed or pending)
        if (anyInvitation) {
          // If invitation is completed
          if (anyInvitation.status === 'completed') {
            console.log("✅ User was invited and completed setup, redirecting to dashboard");
            navigate("/dashboard");
            return;
          } else {
            // If invitation is pending
            console.log("🔍 User was invited but setup is pending");
            navigate(`/register?token=${anyInvitation.invitation_token}`);
            return;
          }
        }
        
        // Check if user has their own company
        console.log("🔍 Checking if user has a company...");
        const { data: userCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        console.log("User company check result:", userCompany);

        if (companyError) {
          console.error("❌ Error checking for user company:", companyError);
          toast.error("Error al verificar la empresa");
          setIsLoading(false);
          return;
        }

        if (userCompany) {
          console.log("✅ User has a company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // If we didn't find a company for this user, check if ANY company exists
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
        
        console.log("Any company check result:", anyCompany);
        
        if (anyCompanyError) {
          console.error("❌ Error checking for any company:", anyCompanyError);
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

  return { companyData, isLoading, isEditing };
}
