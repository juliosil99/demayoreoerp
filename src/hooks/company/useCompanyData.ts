
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
          const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("user_id", userId);

          if (error) {
            console.error("Error checking user company:", error);
            toast.error("Error al verificar la empresa");
            setIsLoading(false);
            return;
          }
          
          if (data && data.length > 0) {
            setIsEditing(true);
            setCompanyData(data[0]);
          }
          setIsLoading(false);
          return;
        }

        // Si no estamos en modo edición, verificamos si existe alguna empresa
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .limit(1);

        if (error) {
          console.error("Error checking for any company:", error);
          toast.error("Error al verificar la empresa");
          setIsLoading(false);
          return;
        }

        // Si existe una empresa, redirigimos al dashboard
        if (data && data.length > 0) {
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
