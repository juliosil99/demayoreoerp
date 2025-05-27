
import { useInviteUser } from "./invitations/useInviteUser";
import { useResendInvitation } from "./invitations/useResendInvitation";
import { useInvitationQueries } from "./invitations/useInvitationQueries";
import { useDeleteInvitation } from "./invitations/useDeleteInvitation";

/**
 * Main hook that combines all invitation-related functionality
 */
export function useUserInvitations() {
  const { inviteUser, isInviting } = useInviteUser();
  const { resendInvitation, isResending } = useResendInvitation();
  const { invitations, isLoading } = useInvitationQueries();
  const { deleteInvitation, isDeleting } = useDeleteInvitation();

  return {
    invitations,
    inviteUser,
    isInviting,
    resendInvitation,
    isResending,
    deleteInvitation,
    isDeleting,
    isLoading
  };
}
