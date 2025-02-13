
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
        // Primero verificamos si hay alguna empresa configurada
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select()
          .limit(1)
          .single();

        if (anyCompanyError && anyCompanyError.code !== 'PGRST116') {
          console.error("Error checking for any company:", anyCompanyError);
          toast.error("Error al verificar la empresa");
          return;
        }

        // Si existe una empresa y no estamos en modo edición, redirigimos al dashboard
        if (anyCompany && !isEditMode) {
          navigate("/dashboard");
          return;
        }

        // Si estamos en modo edición, cargamos los datos de la empresa del usuario
        if (isEditMode) {
          const { data: userCompany, error: userCompanyError } = await supabase
            .from("companies")
            .select()
            .eq("user_id", userId)
            .single();

          if (userCompanyError) {
            if (userCompanyError.code !== 'PGRST116') {
              console.error("Error checking user company:", userCompanyError);
              toast.error("Error al verificar la empresa");
            }
            return;
          }
          
          if (userCompany) {
            setIsEditing(true);
            setCompanyData(userCompany);
          }
        }
      } catch (error) {
        console.error("Error checking company:", error);
        toast.error("Error al verificar la empresa");
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [userId, navigate, isEditMode]);

  return { companyData, isLoading, isEditing };
}
