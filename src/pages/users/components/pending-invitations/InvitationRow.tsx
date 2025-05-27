
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserInvitation } from "../../types";
import { InvitationStatusBadge } from "./InvitationStatusBadge";
import { format } from "date-fns";
import { Trash } from "lucide-react";

interface InvitationRowProps {
  invitation: UserInvitation;
  onResend: (invitation: UserInvitation) => void;
  onDelete: (invitation: UserInvitation) => void;
  isResending: boolean;
  isDeleting: boolean;
  currentResendingId: string | null;
  currentDeletingId: string | null;
}

export function InvitationRow({ 
  invitation, 
  onResend, 
  onDelete,
  isResending, 
  isDeleting,
  currentResendingId,
  currentDeletingId
}: InvitationRowProps) {
  const isThisResending = isResending && currentResendingId === invitation.id;
  const isThisDeleting = isDeleting && currentDeletingId === invitation.id;
  
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
        <div className="flex gap-2">
          {invitation.status === 'pending' || invitation.status === 'expired' ? (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onResend(invitation)} 
              disabled={isResending || isDeleting}
            >
              {isThisResending ? "Enviando..." : "Reenviar"}
            </Button>
          ) : (
            <span className="text-muted-foreground text-sm">No disponible</span>
          )}
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(invitation)}
            disabled={isResending || isDeleting}
          >
            {isThisDeleting ? (
              "Eliminando..."
            ) : (
              <>
                <Trash className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
