
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserInvitations } from "../hooks/useUserInvitations";
import { InvitationsTable } from "./pending-invitations/InvitationsTable";
import { DeleteInvitationDialog } from "./pending-invitations/DeleteInvitationDialog";
import { UserInvitation } from "../types";

export function PendingInvitations() {
  const { 
    invitations, 
    resendInvitation, 
    deleteInvitation,
    isResending, 
    isDeleting,
    isLoading 
  } = useUserInvitations();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<UserInvitation | null>(null);

  const handleDeleteClick = (invitation: UserInvitation) => {
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invitationToDelete) {
      deleteInvitation(invitationToDelete.id);
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Invitaciones</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!invitations?.length) return null;

  return (
    <>
      <Card className="mb-8">
        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Invitaciones</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <InvitationsTable 
            invitations={invitations}
            onResend={resendInvitation}
            onDelete={handleDeleteClick}
            isResending={isResending}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>

      <DeleteInvitationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        invitation={invitationToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
