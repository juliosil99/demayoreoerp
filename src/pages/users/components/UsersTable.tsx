
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Profile, UserPermissions } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Eye, DollarSign, BarChart3 } from "lucide-react";

interface UsersTableProps {
  profiles: Profile[] | null;
  userPermissions: { [key: string]: UserPermissions };
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
  isMobile?: boolean;
  currentUserId?: string;
}

export const UsersTable = memo(function UsersTable({ 
  profiles, 
  userPermissions, 
  onRoleChange,
  isMobile = false,
  currentUserId
}: UsersTableProps) {
  if (!profiles || profiles.length === 0) {
    return <div className="text-center p-6 text-muted-foreground">No hay usuarios disponibles</div>
  }

  const getPermissionIcon = (permission: keyof UserPermissions) => {
    switch (permission) {
      case 'can_manage_users': return <Shield className="h-4 w-4" />;
      case 'can_view_expenses': return <DollarSign className="h-4 w-4" />;
      case 'can_view_sales': return <Eye className="h-4 w-4" />;
      case 'can_view_dashboard': return <BarChart3 className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPermissionLabel = (permission: keyof UserPermissions) => {
    switch (permission) {
      case 'can_manage_users': return 'Gestionar Usuarios';
      case 'can_view_expenses': return 'Ver Gastos';
      case 'can_view_sales': return 'Ver Ventas';
      case 'can_view_dashboard': return 'Ver Dashboard';
      default: return permission;
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {profiles?.map((profile) => {
          const permissions = userPermissions[profile.id];
          return (
            <Card key={profile.id} className={`mb-4 ${profile.id === currentUserId ? 'border-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{profile.email}</div>
                    {profile.id === currentUserId && (
                      <Badge variant="outline" className="mt-1">Tú</Badge>
                    )}
                  </div>
                  <Badge variant={permissions?.role === 'admin' ? 'default' : 'secondary'}>
                    {permissions?.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground mb-3">
                  {profile.company ? `Empresa: ${profile.company.nombre}` : 'Sin empresa asignada'}
                </div>
                
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Rol:</label>
                  <Select
                    value={permissions?.role || 'user'}
                    onValueChange={(value) => onRoleChange(profile.id, value as 'admin' | 'user')}
                    disabled={profile.id === currentUserId}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Permisos:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['can_manage_users', 'can_view_expenses', 'can_view_sales', 'can_view_dashboard'] as const).map((permission) => (
                      <div key={permission} className="flex items-center gap-1">
                        {getPermissionIcon(permission)}
                        <span className="text-xs">{getPermissionLabel(permission)}</span>
                        <div className={`w-2 h-2 rounded-full ml-auto ${
                          permissions?.[permission] ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    ))}
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
            <TableHead className="text-center">Gestionar Usuarios</TableHead>
            <TableHead className="text-center">Ver Gastos</TableHead>
            <TableHead className="text-center">Ver Ventas</TableHead>
            <TableHead className="text-center">Ver Dashboard</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => {
            const permissions = userPermissions[profile.id];
            return (
              <TableRow key={profile.id} className={profile.id === currentUserId ? 'bg-muted/30' : ''}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {profile.email}
                    {profile.id === currentUserId && (
                      <Badge variant="outline">Tú</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{profile.company?.nombre || 'Sin empresa'}</TableCell>
                <TableCell>
                  <Select
                    value={permissions?.role || 'user'}
                    onValueChange={(value) => onRoleChange(profile.id, value as 'admin' | 'user')}
                    disabled={profile.id === currentUserId}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                {(['can_manage_users', 'can_view_expenses', 'can_view_sales', 'can_view_dashboard'] as const).map((permission) => (
                  <TableCell key={permission} className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto ${
                      permissions?.[permission] ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});
