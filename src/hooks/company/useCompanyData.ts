
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

export function useCompanyData(userId: string | undefined, isEditMode: boolean) {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!userId) {
        navigate("/login");
        return;
      }
      
      try {
        // Si estamos en modo edición, intentamos cargar la empresa del usuario actual
        if (isEditMode) {
          const { data: userCompany, error: userCompanyError } = await supabase
            .from("companies")
            .select()
            .eq("user_id", userId)
            .maybeSingle();

          if (userCompanyError) {
            console.error("Error checking user company:", userCompanyError);
            toast.error("Error al verificar la empresa");
            return;
          }
          
          if (userCompany) {
            setIsEditing(true);
            setCompanyData(userCompany);
          }
          setIsLoading(false);
          return;
        }

        // Si no estamos en modo edición, verificamos si existe alguna empresa
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select()
          .limit(1)
          .maybeSingle();

        if (anyCompanyError) {
          console.error("Error checking for any company:", anyCompanyError);
          toast.error("Error al verificar la empresa");
          return;
        }

        // Si existe una empresa, redirigimos al dashboard
        if (anyCompany) {
          navigate("/dashboard");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking company:", error);
        toast.error("Error al verificar la empresa");
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [userId, navigate, isEditMode]);

  return { companyData, isLoading, isEditing };
}
