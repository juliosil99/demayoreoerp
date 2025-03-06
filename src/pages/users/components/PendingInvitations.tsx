
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
import { Send, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";

export function PendingInvitations() {
  const { invitations, resendInvitation, isResending, isLoading } = useUserInvitations();
  const [expandedInvitation, setExpandedInvitation] = useState<string | null>(null);

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

  // Toggle expanded view for an invitation
  const toggleExpandInvitation = (id: string) => {
    if (expandedInvitation === id) {
      setExpandedInvitation(null);
    } else {
      setExpandedInvitation(id);
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
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <React.Fragment key={invitation.id}>
                  <TableRow>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{invitation.role === 'admin' ? 'Administrador' : 'Usuario'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(invitation.status)}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpandInvitation(invitation.id)}>
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
                        onClick={() => toggleExpandInvitation(invitation.id)}
                      >
                        {expandedInvitation === invitation.id ? 'Ocultar' : 'Detalles'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedInvitation === invitation.id && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={6}>
                        <div className="p-2 text-sm">
                          <h4 className="font-semibold mb-2">Información de invitación</h4>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <p><span className="font-medium">ID:</span> {invitation.id}</p>
                              <p><span className="font-medium">Token:</span> {invitation.invitation_token || "No disponible"}</p>
                              <p><span className="font-medium">Estado:</span> {invitation.status}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Creado:</span> {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                              <p><span className="font-medium">URL de inscripción:</span></p>
                              <div className="flex items-center">
                                <code className="text-xs bg-muted p-1 rounded">{`${window.location.origin}/register?token=${invitation.invitation_token || ''}`}</code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 ml-1"
                                  onClick={() => {
                                    if (invitation.invitation_token) {
                                      navigator.clipboard.writeText(`${window.location.origin}/register?token=${invitation.invitation_token}`);
                                    }
                                  }}
                                  disabled={!invitation.invitation_token}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h5 className="font-semibold mb-1">Logs de invitación</h5>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={async () => {
                                try {
                                  const { data, error } = await supabase
                                    .from('invitation_logs')
                                    .select('*')
                                    .eq('invitation_id', invitation.id)
                                    .order('created_at', { ascending: false });
                                    
                                  if (error) throw error;
                                  
                                  console.log("Invitation logs:", data);
                                  alert("Logs mostrados en consola");
                                } catch (err) {
                                  console.error("Error fetching logs:", err);
                                }
                              }}
                            >
                              Ver logs en consola
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
