
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profile, UserPermissions } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Crown } from "lucide-react";

interface SimplifiedUsersTableProps {
  profiles: Profile[] | null;
  userPermissions: { [key: string]: UserPermissions };
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
  isMobile?: boolean;
  currentUserId?: string;
}

export function SimplifiedUsersTable({ 
  profiles, 
  userPermissions, 
  onRoleChange,
  isMobile = false,
  currentUserId
}: SimplifiedUsersTableProps) {
  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No hay usuarios disponibles
      </div>
    );
  }

  const getRoleIcon = (role: 'admin' | 'user', isOwner: boolean) => {
    if (isOwner) return <Crown className="h-4 w-4 text-yellow-600" />;
    if (role === 'admin') return <Shield className="h-4 w-4 text-blue-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const getRoleLabel = (role: 'admin' | 'user', isOwner: boolean) => {
    if (isOwner) return "Propietario";
    return role === 'admin' ? "Administrador" : "Usuario";
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {profiles.map((profile) => {
          const permissions = userPermissions[profile.id];
          const isOwner = profile.company?.id ? false : true; // Simplified logic
          
          return (
            <Card key={profile.id} className={`mb-4 ${profile.id === currentUserId ? 'border-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {profile.email}
                      {profile.id === currentUserId && (
                        <Badge variant="outline" className="ml-2">Tú</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {profile.company ? `Empresa: ${profile.company.nombre}` : 'Sin empresa asignada'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(permissions?.role || 'user', isOwner)}
                    <span className="text-sm font-medium">
                      {getRoleLabel(permissions?.role || 'user', isOwner)}
                    </span>
                  </div>
                  
                  {!isOwner && profile.id !== currentUserId && (
                    <Select
                      value={permissions?.role || 'user'}
                      onValueChange={(value) => onRoleChange(profile.id, value as 'admin' | 'user')}
                    >
                      <SelectTrigger className="w-32 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">Permisos:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {permissions?.canManageUsers && (
                      <Badge variant="secondary" className="text-xs">Gestionar usuarios</Badge>
                    )}
                    {permissions?.canViewExpenses && (
                      <Badge variant="outline" className="text-xs">Ver gastos</Badge>
                    )}
                    {permissions?.canViewSales && (
                      <Badge variant="outline" className="text-xs">Ver ventas</Badge>
                    )}
                    {permissions?.canViewDashboard && (
                      <Badge variant="outline" className="text-xs">Ver dashboard</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Permisos</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => {
            const permissions = userPermissions[profile.id];
            const isOwner = profile.company?.id ? false : true; // Simplified logic
            
            return (
              <TableRow key={profile.id} className={profile.id === currentUserId ? 'bg-muted/30' : ''}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {profile.email}
                    {profile.id === currentUserId && (
                      <Badge variant="outline" className="ml-2">Tú</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{profile.company?.nombre || 'Sin empresa'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(permissions?.role || 'user', isOwner)}
                    <span className="font-medium">
                      {getRoleLabel(permissions?.role || 'user', isOwner)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {permissions?.canManageUsers && (
                      <Badge variant="secondary" className="text-xs">Usuarios</Badge>
                    )}
                    {permissions?.canViewExpenses && (
                      <Badge variant="outline" className="text-xs">Gastos</Badge>
                    )}
                    {permissions?.canViewSales && (
                      <Badge variant="outline" className="text-xs">Ventas</Badge>
                    )}
                    {permissions?.canViewDashboard && (
                      <Badge variant="outline" className="text-xs">Dashboard</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {!isOwner && profile.id !== currentUserId ? (
                    <Select
                      value={permissions?.role || 'user'}
                      onValueChange={(value) => onRoleChange(profile.id, value as 'admin' | 'user')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
