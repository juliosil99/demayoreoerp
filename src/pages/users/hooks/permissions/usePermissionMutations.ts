
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
      const { error } = await supabase
        .from('company_users')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

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

      // Invalidar caché de permisos para el usuario específico
      queryClient.invalidateQueries({ 
        queryKey: ["simplified-user-permissions", userId] 
      });

      // También invalidar consultas relacionadas con usuarios
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });

      toast.success('Rol actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar el rol');
    }
  });

  return { handleRoleChange };
}
