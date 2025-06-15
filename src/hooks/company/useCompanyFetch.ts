
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CompanyData {
  nombre: string;
  rfc: string;
  codigo_postal: string;
  regimen_fiscal: string;
  direccion: string | null;
  telefono: string | null;
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
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        if (isEditMode) {
          const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) {
            toast.error("Error al verificar la empresa");
            setIsLoading(false);
            return;
          }
          
          if (!data) {
            toast.error("No tienes permiso para editar esta empresa");
            // Don't navigate away, just show the error
            setIsLoading(false);
            return;
          }
          
          setIsEditing(true);
          setCompanyData(data);
        }
        
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          // Silently catch
        }
        toast.error("Error al verificar la empresa");
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [userId, navigate, isEditMode]);

  return { companyData, isLoading, isEditing };
}
