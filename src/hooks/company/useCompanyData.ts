
import { useCompanyFetch } from "./useCompanyFetch";
import { useCompanyInvitations } from "./useCompanyInvitations";
import { checkRFCExists } from "./utils/rfcChecker";

// Re-export the RFC checker function to be used in forms
export { checkRFCExists };

/**
 * Main hook for company data management.
 * Combines company data fetching and invitation checking.
 * 
 * @param userId The ID of the user
 * @param isEditMode Whether the company is being edited
 * @returns Company data and status information
 */
export function useCompanyData(userId: string | undefined, isEditMode: boolean) {
  const { companyData, isLoading: isFetchLoading, isEditing } = useCompanyFetch(userId, isEditMode);
  
  // We're combining the hooks separately, but we'll only check invitations if we're not editing
  const userEmail = userId ? userId : undefined; // This is a simplification, in a real app you'd get the email from the auth context
  const { isLoading: isInvitationLoading } = !isEditMode 
    ? useCompanyInvitations(userEmail, userId)
    : { isLoading: false };

  return { 
    companyData, 
    isLoading: isFetchLoading || isInvitationLoading, 
    isEditing 
  };
}
