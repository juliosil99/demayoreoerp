
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
import { Send, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function PendingInvitations() {
  const { invitations, resendInvitation, isResending, isLoading } = useUserInvitations();

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!invitations?.length) return null;

  // Function to get badge color based on status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completada</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Invitaciones</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
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
                        {invitation.status === 'expired' ? (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
