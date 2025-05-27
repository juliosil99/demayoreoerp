
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserInvitation } from "../../types";
import { InvitationRow } from "./InvitationRow";
import { useState } from "react";

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
  
  const handleResend = (invitation: UserInvitation) => {
    setCurrentResendingId(invitation.id);
    onResend(invitation);
    // Reset the ID after a timeout in case the request fails
    setTimeout(() => {
      setCurrentResendingId(null);
    }, 5000);
  };

  const handleDelete = (invitation: UserInvitation) => {
    setCurrentDeletingId(invitation.id);
    onDelete(invitation);
    // Reset the ID after a timeout in case the request fails
    setTimeout(() => {
      setCurrentDeletingId(null);
    }, 5000);
  };
  
  if (!invitations || invitations.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No hay invitaciones pendientes</p>;
  }
  
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
        {invitations.map(invitation => (
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
        ))}
      </TableBody>
    </Table>
  );
}
