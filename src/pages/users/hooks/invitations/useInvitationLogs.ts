
import { supabase } from "@/lib/supabase";

/**
 * Hook for creating and managing invitation logs
 */
export const useInvitationLogs = () => {
  /**
   * Creates a new log entry for an invitation
   */
  const createInvitationLog = async (invitationId: string, status: string, errorMessage?: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('invitation_logs')
        .insert({
          invitation_id: invitationId,
          status,
          error_message: errorMessage,
          attempted_by: session.session?.user.id || '00000000-0000-0000-0000-000000000000'
        });

      if (error) {
        console.error("Error creating invitation log:", error);
      }
    } catch (err) {
      console.error("Error in createInvitationLog:", err);
    }
  };

  return {
    createInvitationLog
  };
};
