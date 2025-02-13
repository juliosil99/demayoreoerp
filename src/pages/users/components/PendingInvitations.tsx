
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useUserInvitations } from "../hooks/useUserInvitations";
import { format } from "date-fns";
import { Send } from "lucide-react";

export function PendingInvitations() {
  const { invitations, resendInvitation, isResending } = useUserInvitations();

  if (!invitations?.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Invitaciones Pendientes</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Invitación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>{invitation.role === 'admin' ? 'Administrador' : 'Usuario'}</TableCell>
                <TableCell>{invitation.status === 'pending' ? 'Pendiente' : 'Completada'}</TableCell>
                <TableCell>
                  {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {invitation.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendInvitation(invitation)}
                      disabled={isResending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reenviar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
