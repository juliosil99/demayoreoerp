
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
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle, Info, Loader2 } from "lucide-react";
import { InvitationStatusBadge } from "./InvitationStatusBadge";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvitationsTableProps {
  invitations: UserInvitation[];
  resendInvitation: (invitation: UserInvitation) => void;
  isResending: boolean;
}

export function InvitationsTable({ invitations, resendInvitation, isResending }: InvitationsTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="mb-4">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">Email:</div>
                  <div className="font-medium text-sm">{invitation.email}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Rol:</div>
                    <div className="text-sm">{invitation.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Estado:</div>
                    <InvitationStatusBadge status={invitation.status} />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground">Fecha:</div>
                  <div className="text-sm">{format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm')}</div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  {(invitation.status === 'pending' || invitation.status === 'expired') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendInvitation(invitation)}
                      disabled={isResending}
                      className="text-xs"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Enviando...
                        </>
                      ) : invitation.status === 'expired' ? (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                          Reactivar
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-1" />
                          Reenviar
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => alert("Mostrar detalles")}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
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
