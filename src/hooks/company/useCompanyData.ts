
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
        const { data, error } = await supabase
          .from("companies")
          .select()
          .eq("user_id", userId)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error("Error checking company:", error);
            toast.error("Error al verificar la empresa");
          }
          return;
        }
        
        if (data && isEditMode) {
          setIsEditing(true);
          setCompanyData(data);
        } else if (data && !isEditMode) {
          navigate("/dashboard");
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
