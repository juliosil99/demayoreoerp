
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

/**
 * Hook to fetch company data for a user in edit mode
 * @param userId The ID of the user
 * @param isEditMode Whether the company is being edited
 * @returns Company data, loading state, and edit state
 */
export function useCompanyFetch(userId: string | undefined, isEditMode: boolean) {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      console.log("🔍 Starting fetchCompanyData...");
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

          if (error) {
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
          
          if (!data) {
            console.log("ℹ️ No company found for user");
            navigate("/company-setup");
            return;
          }
          
          console.log("✅ Company found for user:", data);
          setIsEditing(true);
          setCompanyData(data);
          setIsLoading(false);
          return;
        }
        
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

    fetchCompanyData();
  }, [userId, navigate, isEditMode]);

  return { companyData, isLoading, isEditing };
}
