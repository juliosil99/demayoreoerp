
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
  const { data, error } = await supabase
    .from("companies")
    .select("rfc")
    .eq("rfc", rfc)
    .limit(1);

  if (error) {
    console.error("Error checking RFC:", error);
    return false;
  }

  return data && data.length > 0;
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
        // Si estamos en modo edición, intentamos cargar la empresa del usuario actual
        if (isEditMode) {
          console.log("📝 Edit mode detected, fetching company for user:", userId);
          
          const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("user_id", userId);

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
          
          if (data && data.length > 0) {
            console.log("✅ Company found for user:", data[0]);
            setIsEditing(true);
            setCompanyData(data[0]);
          } else {
            console.log("ℹ️ No company found for user");
          }
          setIsLoading(false);
          return;
        }

        // Si no estamos en modo edición, verificamos si existe alguna empresa
        console.log("🔍 Checking for any existing company...");
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .limit(1);

        console.log("Query response for any company - data:", data);
        console.log("Query response for any company - error:", error);

        if (error) {
          console.error("❌ Error checking for any company:", error);
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          toast.error("Error al verificar la empresa");
          setIsLoading(false);
          return;
        }

        // Si existe una empresa, redirigimos al dashboard
        if (data && data.length > 0) {
          console.log("✅ Existing company found, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }

        console.log("ℹ️ No existing company found, staying on setup page");
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
