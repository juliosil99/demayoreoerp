
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Shield, User, Eye, DollarSign, BarChart3, Users, FileText, Building, Banknote, Receipt, GitMerge } from "lucide-react";
import { UserWithPermissions, PermissionName, useGranularPermissions } from "../hooks/permissions/useGranularPermissions";
import { useAuth } from "@/contexts/AuthContext";

interface GranularPermissionsTableProps {
  users: UserWithPermissions[];
  onUpdatePermission: (userId: string, permissionName: string, canAccess: boolean) => void;
  onUpdateRole: (userId: string, role: 'admin' | 'user') => void;
}

const getPermissionIcon = (permission: PermissionName) => {
  switch (permission) {
    case 'can_manage_users': return <Users className="h-4 w-4" />;
    case 'can_view_dashboard': return <BarChart3 className="h-4 w-4" />;
    case 'can_view_sales':
    case 'can_manage_sales': return <Eye className="h-4 w-4" />;
    case 'can_view_expenses':
    case 'can_manage_expenses': return <DollarSign className="h-4 w-4" />;
    case 'can_view_reports': return <FileText className="h-4 w-4" />;
    case 'can_manage_contacts': return <Building className="h-4 w-4" />;
    case 'can_view_banking':
    case 'can_manage_banking': return <Banknote className="h-4 w-4" />;
    case 'can_view_invoices':
    case 'can_manage_invoices': return <Receipt className="h-4 w-4" />;
    case 'can_view_reconciliation':
    case 'can_manage_reconciliation': return <GitMerge className="h-4 w-4" />;
    default: return <User className="h-4 w-4" />;
  }
};

const getPermissionLabel = (permission: PermissionName) => {
  const labels: Record<PermissionName, string> = {
    'can_view_dashboard': 'Ver Dashboard',
    'can_view_sales': 'Ver Ventas',
    'can_manage_sales': 'Gestionar Ventas',
    'can_view_expenses': 'Ver Gastos',
    'can_manage_expenses': 'Gestionar Gastos',
    'can_view_reports': 'Ver Reportes',
    'can_manage_users': 'Gestionar Usuarios',
    'can_manage_contacts': 'Gestionar Contactos',
    'can_view_banking': 'Ver Banca',
    'can_manage_banking': 'Gestionar Banca',
    'can_view_invoices': 'Ver Facturas',
    'can_manage_invoices': 'Gestionar Facturas',
    'can_view_reconciliation': 'Ver Conciliación',
    'can_manage_reconciliation': 'Gestionar Conciliación'
  };
  return labels[permission] || permission;
};

export function GranularPermissionsTable({ 
  users, 
  onUpdatePermission, 
  onUpdateRole 
}: GranularPermissionsTableProps) {
  const { user: currentUser } = useAuth();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [isMobile] = useState(window.innerWidth < 768);

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handlePermissionChange = (userId: string, permissionName: string, checked: boolean) => {
    onUpdatePermission(userId, permissionName, checked);
  };

  const handleRoleChange = (userId: string, role: 'admin' | 'user') => {
    onUpdateRole(userId, role);
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No hay usuarios disponibles
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className={`${user.id === currentUser?.id ? 'border-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{user.email}</div>
                  {user.id === currentUser?.id && (
                    <Badge variant="outline" className="mt-1">Tú</Badge>
                  )}
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground mb-3">
                {user.company ? `Empresa: ${user.company.nombre}` : 'Sin empresa asignada'}
              </div>
              
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1 block">Rol:</label>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'user')}
                  disabled={user.id === currentUser?.id}
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
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">Permisos:</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserExpansion(user.id)}
                    className="h-auto p-1"
                  >
                    {expandedUsers.has(user.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {expandedUsers.has(user.id) && (
                  <div className="grid grid-cols-1 gap-2">
                    {user.permissions.map((permission) => (
                      <div key={permission.permission_name} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getPermissionIcon(permission.permission_name as PermissionName)}
                          <span className="text-xs">{getPermissionLabel(permission.permission_name as PermissionName)}</span>
                        </div>
                        <Switch
                          checked={permission.can_access}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(user.id, permission.permission_name, checked)
                          }
                          disabled={user.id === currentUser?.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
            <TableHead className="text-center">Dashboard</TableHead>
            <TableHead className="text-center">Ver Ventas</TableHead>
            <TableHead className="text-center">Gest. Ventas</TableHead>
            <TableHead className="text-center">Ver Gastos</TableHead>
            <TableHead className="text-center">Gest. Gastos</TableHead>
            <TableHead className="text-center">Usuarios</TableHead>
            <TableHead className="text-center">Reportes</TableHead>
            <TableHead className="text-center">Contactos</TableHead>
            <TableHead className="text-center">Banca</TableHead>
            <TableHead className="text-center">Facturas</TableHead>
            <TableHead className="text-center">Conciliación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={user.id === currentUser?.id ? 'bg-muted/30' : ''}>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {user.email}
                  {user.id === currentUser?.id && (
                    <Badge variant="outline">Tú</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.company?.nombre || 'Sin empresa'}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'user')}
                  disabled={user.id === currentUser?.id}
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
              {['can_view_dashboard', 'can_view_sales', 'can_manage_sales', 'can_view_expenses', 'can_manage_expenses', 'can_manage_users', 'can_view_reports', 'can_manage_contacts', 'can_view_banking', 'can_view_invoices', 'can_view_reconciliation'].map((permissionName) => {
                const permission = user.permissions.find(p => p.permission_name === permissionName);
                return (
                  <TableCell key={permissionName} className="text-center">
                    <Switch
                      checked={permission?.can_access || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(user.id, permissionName, checked)
                      }
                      disabled={user.id === currentUser?.id}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
