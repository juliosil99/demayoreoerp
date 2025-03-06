
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

export function useCompanyUsers(companyId?: string) {
  const queryClient = useQueryClient();
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Fetch company users
  const { data: companyUsers, isLoading } = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("company_users")
        .select(`
          *,
          user:user_id (
            email:email,
            first_name:first_name,
            last_name:last_name
          )
        `)
        .eq("company_id", companyId);
      
      if (error) {
        console.error("Error fetching company users:", error);
        toast.error("Error al cargar usuarios de la empresa");
        throw error;
      }
      
      return data as CompanyUser[];
    },
    enabled: !!companyId,
  });

  // Add user to company
  const addUserToCompany = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      setIsAddingUser(true);
      
      try {
        // First, find the user by email
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("email", email)
          .maybeSingle();
        
        if (profileError) {
          throw profileError;
        }
        
        if (!profiles) {
          throw new Error(`No se encontró usuario con el correo ${email}`);
        }
        
        // Check if the user is already in the company
        const { data: existingUser, error: existingError } = await supabase
          .from("company_users")
          .select("*")
          .eq("company_id", companyId)
          .eq("user_id", profiles.id)
          .maybeSingle();
        
        if (existingError) {
          throw existingError;
        }
        
        if (existingUser) {
          throw new Error(`El usuario ya tiene acceso a esta empresa`);
        }
        
        // Add the user to the company
        const { error: insertError } = await supabase
          .from("company_users")
          .insert({
            company_id: companyId,
            user_id: profiles.id,
            role: role,
          });
        
        if (insertError) {
          throw insertError;
        }
        
        return { success: true, message: `Usuario agregado correctamente` };
      } finally {
        setIsAddingUser(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast.success("Usuario agregado a la empresa correctamente");
    },
    onError: (error: Error) => {
      console.error("Error adding user to company:", error);
      toast.error(`Error: ${error.message}`);
    },
  });

  // Remove user from company
  const removeUserFromCompany = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("company_users")
        .delete()
        .eq("company_id", companyId)
        .eq("user_id", userId);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast.success("Usuario removido de la empresa correctamente");
    },
    onError: (error: any) => {
      console.error("Error removing user from company:", error);
      toast.error(`Error al remover usuario: ${error.message}`);
    },
  });

  // Update user role
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("company_users")
        .update({ role })
        .eq("company_id", companyId)
        .eq("user_id", userId);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast.success("Rol actualizado correctamente");
    },
    onError: (error: any) => {
      console.error("Error updating user role:", error);
      toast.error(`Error al actualizar rol: ${error.message}`);
    },
  });

  // Check if current user has access to company
  const checkCompanyAccess = async (userId: string, companyId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('can_access_company', {
          user_id: userId,
          company_id: companyId
        });
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking company access:", error);
      return false;
    }
  };

  return {
    companyUsers,
    isLoading,
    isAddingUser,
    addUserToCompany,
    removeUserFromCompany,
    updateUserRole,
    checkCompanyAccess
  };
}
