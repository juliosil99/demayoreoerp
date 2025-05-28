
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useInvitationSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncInvitationStatuses = async () => {
    try {
      setIsSyncing(true);
      console.log("🔄 Iniciando sincronización de invitaciones...");

      // Buscar invitaciones pendientes donde el usuario ya existe en company_users
      const { data: pendingInvitations, error: pendingError } = await supabase
        .from("user_invitations")
        .select(`
          id,
          email,
          status,
          invited_by,
          company_id
        `)
        .eq("status", "pending");

      if (pendingError) {
        console.error("❌ Error obteniendo invitaciones pendientes:", pendingError);
        throw pendingError;
      }

      console.log(`📋 Encontradas ${pendingInvitations?.length || 0} invitaciones pendientes`);

      if (!pendingInvitations || pendingInvitations.length === 0) {
        toast.success("No hay invitaciones pendientes para sincronizar");
        return;
      }

      let syncedCount = 0;

      for (const invitation of pendingInvitations) {
        // Verificar si existe un usuario en company_users con una invitación para este email
        const { data: companyUsers, error: companyUserError } = await supabase
          .from("company_users")
          .select(`
            user_id,
            company_id,
            profiles!inner(email)
          `)
          .eq("company_id", invitation.company_id)
          .eq("profiles.email", invitation.email);

        if (companyUserError) {
          console.error(`❌ Error verificando usuario para ${invitation.email}:`, companyUserError);
          continue;
        }

        if (companyUsers && companyUsers.length > 0) {
          const userId = companyUsers[0].user_id;
          console.log(`✅ Usuario encontrado para ${invitation.email}: ${userId}`);

          // Actualizar estado de invitación a completado
          const { error: updateError } = await supabase
            .from("user_invitations")
            .update({ status: "completed" })
            .eq("id", invitation.id);

          if (updateError) {
            console.error(`❌ Error actualizando invitación ${invitation.id}:`, updateError);
            continue;
          }

          // Crear log de completado
          const { error: logError } = await supabase
            .from("invitation_logs")
            .insert({
              invitation_id: invitation.id,
              status: "completed",
              error_message: "Sincronizado automáticamente",
              attempted_by: userId
            });

          if (logError) {
            console.error(`❌ Error creando log para invitación ${invitation.id}:`, logError);
          }

          syncedCount++;
          console.log(`✅ Invitación sincronizada: ${invitation.email}`);
        }
      }

      if (syncedCount > 0) {
        toast.success(`Se sincronizaron ${syncedCount} invitaciones exitosamente`);
        console.log(`🎉 Sincronización completada: ${syncedCount} invitaciones actualizadas`);
      } else {
        toast.info("No se encontraron invitaciones que requieran sincronización");
      }

    } catch (error: any) {
      console.error("❌ Error en sincronización de invitaciones:", error);
      toast.error("Error al sincronizar invitaciones: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncInvitationStatuses,
    isSyncing
  };
}
