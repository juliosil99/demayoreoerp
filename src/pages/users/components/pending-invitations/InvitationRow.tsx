
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Send, AlertTriangle, Info, Loader2 } from "lucide-react";
import { UserInvitation } from "../../types";
import { InvitationStatusBadge } from "./InvitationStatusBadge";
import { InvitationDetailsPanel } from "./InvitationDetailsPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvitationRowProps {
  invitation: UserInvitation;
  resendInvitation: (invitation: UserInvitation) => void;
  isResending: boolean;
}

export function InvitationRow({ invitation, resendInvitation, isResending }: InvitationRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>{invitation.email}</TableCell>
        <TableCell>{invitation.role === 'admin' ? 'Administrador' : 'Usuario'}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <InvitationStatusBadge status={invitation.status} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleExpand}>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {invitation.status === 'pending' ? 'Ver detalles de la invitación' : 
                  invitation.status === 'expired' ? 'Ver por qué expiró' : 
                  'Ver cuándo fue completada'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
        <TableCell>
          {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm')}
        </TableCell>
        <TableCell>
          {(invitation.status === 'pending' || invitation.status === 'expired') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resendInvitation(invitation)}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : invitation.status === 'expired' ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Reactivar y Reenviar
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Reenviar
                </>
              )}
            </Button>
          )}
        </TableCell>
        <TableCell>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleExpand}
          >
            {isExpanded ? 'Ocultar' : 'Detalles'}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/20">
          <TableCell colSpan={6}>
            <InvitationDetailsPanel invitation={invitation} />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
