
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserPermissions, rolePermissions } from "../../types";

export function usePermissionMutations(setUserPermissions: React.Dispatch<React.SetStateAction<{ [key: string]: UserPermissions }>>) {
  const queryClient = useQueryClient();

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      // Find the company user relationship
      const { data: userCompany, error: findError } = await supabase
        .from("company_users")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (findError && findError.code !== 'PGRST116') { // Not found error
        throw findError;
      }

      // If found, update the role
      if (userCompany) {
        const { error } = await supabase
          .from("company_users")
          .update({ role })
          .eq("id", userCompany.id);

        if (error) throw error;
      } else {
        // This shouldn't happen in the updated system, but as a fallback
        // update the user_roles table
        const { error } = await supabase
          .from("user_roles")
          .upsert({
            user_id: userId,
            role: role
          });

        if (error) throw error;
      }

      // Update local state with role-based permissions
      const newPermissions = rolePermissions[role];
      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          role: role,
          ...newPermissions
        }
      }));

      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      toast.success(`Rol actualizado a ${role === 'admin' ? 'Administrador' : 'Usuario'}`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol: " + error.message);
    }
  };

  return { handleRoleChange };
}
