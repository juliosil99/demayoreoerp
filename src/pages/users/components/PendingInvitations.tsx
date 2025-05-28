
import React, { useState, useEffect } from "react";
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

  // Log invitations state changes
  useEffect(() => {
    console.log("📋 [COMPONENT] PendingInvitations - invitations changed:", {
      invitations,
      count: invitations?.length || 0,
      isLoading,
      isDeleting
    });
  }, [invitations, isLoading, isDeleting]);

  const handleDeleteClick = (invitation: UserInvitation) => {
    console.log("🗑️ [COMPONENT] Delete button clicked for invitation:", invitation.id);
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invitationToDelete) {
      console.log("✅ [COMPONENT] Delete confirmed for invitation:", invitationToDelete.id);
      console.log("📊 [COMPONENT] Invitations before deletion:", invitations?.length);
      
      deleteInvitation(invitationToDelete.id);
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    console.log("🚪 [COMPONENT] Dialog close triggered:", open);
    setDeleteDialogOpen(open);
    if (!open) {
      setInvitationToDelete(null);
    }
  };

  if (isLoading) {
    console.log("⏳ [COMPONENT] PendingInvitations is loading...");
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

  if (!invitations?.length) {
    console.log("📭 [COMPONENT] No invitations to display");
    return null;
  }

  console.log("🎨 [COMPONENT] Rendering PendingInvitations with", invitations.length, "invitations");

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
        onOpenChange={handleDialogClose}
        invitation={invitationToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
