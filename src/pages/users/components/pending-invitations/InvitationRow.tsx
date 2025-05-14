
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserInvitation } from "../../types";
import { InvitationStatusBadge } from "./InvitationStatusBadge";
import { format } from "date-fns";

interface InvitationRowProps {
  invitation: UserInvitation;
  onResend: (invitation: UserInvitation) => void;
  isResending: boolean;
  currentResendingId: string | null;
}

export function InvitationRow({ 
  invitation, 
  onResend, 
  isResending, 
  currentResendingId 
}: InvitationRowProps) {
  const isThisResending = isResending && currentResendingId === invitation.id;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Fecha inválida";
    }
  };
  
  return (
    <TableRow>
      <TableCell className="font-medium">{invitation.email}</TableCell>
      <TableCell>{invitation.company_name || 'N/A'}</TableCell>
      <TableCell>{invitation.role === 'admin' ? 'Administrador' : 'Usuario'}</TableCell>
      <TableCell>{formatDate(invitation.created_at)}</TableCell>
      <TableCell>
        <InvitationStatusBadge status={invitation.status} />
      </TableCell>
      <TableCell>
        {invitation.status === 'pending' || invitation.status === 'expired' ? (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onResend(invitation)} 
            disabled={isResending}
          >
            {isThisResending ? "Enviando..." : "Reenviar"}
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">No disponible</span>
        )}
      </TableCell>
    </TableRow>
  );
}
