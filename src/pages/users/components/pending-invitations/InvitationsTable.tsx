
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserInvitation } from "../../types";
import { InvitationRow } from "./InvitationRow";

interface InvitationsTableProps {
  invitations: UserInvitation[];
  resendInvitation: (invitation: UserInvitation) => void;
  isResending: boolean;
}

export function InvitationsTable({ invitations, resendInvitation, isResending }: InvitationsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Invitación</TableHead>
            <TableHead>Acciones</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <InvitationRow 
              key={invitation.id}
              invitation={invitation}
              resendInvitation={resendInvitation}
              isResending={isResending}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
