
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
          
          // Changed from .single() to .select().eq().maybeSingle() to avoid 406 error
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

        // Check if user was invited (via user_invitations)
        console.log("🔍 Checking if user was invited...");
        const userResponse = await supabase.auth.getUser();
        const userEmail = userResponse.data.user?.email;
        console.log("Current user email:", userEmail);
        
        if (!userEmail) {
          console.log("❌ No user email found");
          setIsLoading(false);
          return;
        }
        
        const { data: invitationData, error: invitationError } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("email", userEmail)
          .eq("status", "completed")
          .maybeSingle();
        
        console.log("Invitation check query:", {
          email: userEmail,
          status: "completed"
        });
        console.log("Invitation check result:", invitationData);
        
        if (invitationError) {
          console.error("❌ Error checking user invitation:", invitationError);
          console.error("Error details:", {
            message: invitationError.message,
            details: invitationError.details,
            hint: invitationError.hint
          });
        }
        
        const wasInvited = !!invitationData;
        console.log("Was user invited?", wasInvited);
        
        // If user was invited, redirect to dashboard immediately
        if (wasInvited) {
          console.log("✅ User was invited, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Check if company is already configured
        console.log("🔍 Checking if company exists...");
        // Changed from using limit(1) to specifically checking for user's company
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        console.log("Query response for company check - data:", data);
        console.log("Query response for company check - error:", error);

        if (error) {
          console.error("❌ Error checking for company:", error);
          toast.error("Error al verificar la empresa");
          setIsLoading(false);
          return;
        }

        if (data) {
          console.log("✅ Company exists for current user, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // If we didn't find a company for this user, check if ANY company exists
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
        
        console.log("Query for any company - data:", anyCompany);
        
        if (anyCompanyError) {
          console.error("❌ Error checking for any company:", anyCompanyError);
        }
        
        if (anyCompany && anyCompany.length > 0) {
          console.log("✅ Company exists in the system, checking if user was invited");
          
          // Double-check invitation status to be sure
          const { data: doubleCheckInvitation } = await supabase
            .from("user_invitations")
            .select("*")
            .eq("email", userEmail)
            .maybeSingle();
            
          if (doubleCheckInvitation) {
            console.log("✅ User was invited, redirecting to dashboard");
            navigate("/dashboard");
            return;
          }
          
          console.log("❌ No invitation found but company exists, staying on setup");
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
