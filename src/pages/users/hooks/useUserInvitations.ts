
import { useInviteUser } from "./invitations/useInviteUser";
import { useResendInvitation } from "./invitations/useResendInvitation";
import { useInvitationQueries } from "./invitations/useInvitationQueries";

/**
 * Main hook that combines all invitation-related functionality
 */
export function useUserInvitations() {
  const { inviteUser, isInviting } = useInviteUser();
  const { resendInvitation, isResending } = useResendInvitation();
  const { invitations, isLoading } = useInvitationQueries();

  return {
    invitations,
    inviteUser,
    isInviting,
    resendInvitation,
    isResending,
    isLoading
  };
}
