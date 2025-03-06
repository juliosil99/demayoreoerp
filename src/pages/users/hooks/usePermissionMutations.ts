
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePermissionMutations() {
  const queryClient = useQueryClient();

  const handlePermissionChange = async (userId: string, page: string, checked: boolean) => {
    try {
      console.log(`Updating permission for user ${userId}, page ${page} to ${checked}`);
      const { error } = await supabase
        .from("page_permissions")
        .upsert({
          user_id: userId,
          page_path: page,
          can_access: checked
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["page-permissions"] });
      toast.success("Permisos actualizados correctamente");
      return true;
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast.error("Error al actualizar permisos: " + error.message);
      return false;
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      console.log(`Updating role for user ${userId} to ${role}`);
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success("Rol actualizado correctamente");
      return true;
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol: " + error.message);
      return false;
    }
  };

  return {
    handlePermissionChange,
    handleRoleChange
  };
}
