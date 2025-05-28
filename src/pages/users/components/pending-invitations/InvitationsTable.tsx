
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserInvitation } from "../../types";
import { InvitationRow } from "./InvitationRow";
import { useState, useEffect } from "react";

export interface InvitationsTableProps {
  invitations: UserInvitation[] | null;
  onResend: (invitation: UserInvitation) => void;
  onDelete: (invitation: UserInvitation) => void;
  isResending: boolean;
  isDeleting: boolean;
}

export function InvitationsTable({ 
  invitations,
  onResend,
  onDelete,
  isResending,
  isDeleting
}: InvitationsTableProps) {
  const [currentResendingId, setCurrentResendingId] = useState<string | null>(null);
  const [currentDeletingId, setCurrentDeletingId] = useState<string | null>(null);

  // Log props changes
  useEffect(() => {
    console.log("📊 [TABLE] InvitationsTable props changed:", {
      invitationsCount: invitations?.length || 0,
      invitations: invitations?.map(inv => ({ id: inv.id, email: inv.email })),
      isResending,
      isDeleting,
      currentResendingId,
      currentDeletingId
    });
  }, [invitations, isResending, isDeleting, currentResendingId, currentDeletingId]);
  
  const handleResend = (invitation: UserInvitation) => {
    console.log("📤 [TABLE] Resend triggered for invitation:", invitation.id);
    setCurrentResendingId(invitation.id);
    onResend(invitation);
  };

  const handleDelete = (invitation: UserInvitation) => {
    console.log("🗑️ [TABLE] Delete triggered for invitation:", invitation.id);
    setCurrentDeletingId(invitation.id);
    onDelete(invitation);
  };

  // Reset states when operations complete
  useEffect(() => {
    if (!isResending) {
      console.log("✅ [TABLE] Resending completed, clearing currentResendingId");
      setCurrentResendingId(null);
    }
  }, [isResending]);

  useEffect(() => {
    if (!isDeleting) {
      console.log("✅ [TABLE] Deleting completed, clearing currentDeletingId");
      setCurrentDeletingId(null);
    }
  }, [isDeleting]);
  
  if (!invitations || invitations.length === 0) {
    console.log("📭 [TABLE] No invitations to display in table");
    return <p className="text-center py-4 text-muted-foreground">No hay invitaciones pendientes</p>;
  }

  console.log("🎨 [TABLE] Rendering table with", invitations.length, "invitations");
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map(invitation => {
          console.log("🔄 [TABLE] Rendering row for invitation:", invitation.id);
          return (
            <InvitationRow 
              key={invitation.id}
              invitation={invitation}
              onResend={handleResend}
              onDelete={handleDelete}
              isResending={isResending}
              isDeleting={isDeleting}
              currentResendingId={currentResendingId}
              currentDeletingId={currentDeletingId}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
