
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserPermissions } from "../../types";

export function usePermissionMutations(
  setUserPermissions: React.Dispatch<React.SetStateAction<{ [key: string]: UserPermissions }>>
) {
  const queryClient = useQueryClient();

  const handleRoleChange = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      console.log(`🔄 [PERMISSION_MUTATIONS] Changing role for user ${userId} to ${newRole}`);
      
      const { error } = await supabase
        .from('company_users')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ [PERMISSION_MUTATIONS] Error updating role:', error);
        throw error;
      }

      console.log(`✅ [PERMISSION_MUTATIONS] Role updated successfully for user ${userId}`);
      return { userId, newRole };
    },
    onSuccess: ({ userId, newRole }) => {
      // Actualizar estado local inmediatamente
      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          role: newRole as 'admin' | 'user'
        }
      }));

      // CRITICAL FIX: Invalidar caché de permisos para el usuario específico
      console.log(`🔄 [PERMISSION_MUTATIONS] Invalidating permissions cache for user: ${userId}`);
      queryClient.invalidateQueries({ 
        queryKey: ["simplified-user-permissions", userId] 
      });

      // También invalidar consultas relacionadas con usuarios
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });

      toast.success('Rol actualizado correctamente');
      console.log(`✅ [PERMISSION_MUTATIONS] All caches invalidated for user ${userId}`);
    },
    onError: (error) => {
      console.error('❌ [PERMISSION_MUTATIONS] Error in role change mutation:', error);
      toast.error('Error al actualizar el rol');
    }
  });

  return { handleRoleChange };
}
