
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserPermissions {
  userId: string;
  pages: { [key: string]: boolean };
  role: 'admin' | 'user';
}

const availablePages = [
  { path: "/dashboard", label: "Panel de Control" },
  { path: "/sales", label: "Ventas" },
  { path: "/expenses", label: "Gastos" },
  { path: "/contacts", label: "Contactos" },
  { path: "/banking", label: "Bancos" },
  { path: "/accounting/chart-of-accounts", label: "Catálogo de Cuentas" },
  { path: "/reconciliation", label: "Conciliación" },
];

export default function UserManagement() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: { users: authUsers }, error } = await supabase.auth.admin.list();
      if (error) {
        toast.error("Error al cargar usuarios: " + error.message);
        throw error;
      }
      return authUsers;
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data: pagePerms, error: pageError } = await supabase
        .from("page_permissions")
        .select("*");
      
      const { data: rolePerms, error: roleError } = await supabase
        .from("user_roles")
        .select("*");

      if (pageError) {
        toast.error("Error al cargar permisos de página: " + pageError.message);
        throw pageError;
      }
      if (roleError) {
        toast.error("Error al cargar roles: " + roleError.message);
        throw roleError;
      }

      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      pagePerms?.forEach((perm) => {
        if (!permissionsMap[perm.user_id]) {
          permissionsMap[perm.user_id] = {
            userId: perm.user_id,
            pages: {},
            role: 'user'
          };
        }
        permissionsMap[perm.user_id].pages[perm.page_path] = perm.can_access;
      });

      rolePerms?.forEach((role) => {
        if (!permissionsMap[role.user_id]) {
          permissionsMap[role.user_id] = {
            userId: role.user_id,
            pages: {},
            role: role.role
          };
        } else {
          permissionsMap[role.user_id].role = role.role;
        }
      });

      setUserPermissions(permissionsMap);
      return permissionsMap;
    },
  });

  const handlePermissionChange = async (userId: string, page: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from("page_permissions")
        .upsert({
          user_id: userId,
          page_path: page,
          can_access: checked
        });

      if (error) throw error;

      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          pages: {
            ...prev[userId]?.pages,
            [page]: checked
          }
        }
      }));

      toast.success("Permisos actualizados");
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast.error("Error al actualizar permisos: " + error.message);
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          role: role
        }
      }));

      toast.success("Rol actualizado");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol: " + error.message);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              {availablePages.map((page) => (
                <TableHead key={page.path}>{page.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <select
                    value={userPermissions[user.id]?.role || 'user'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                    className="border rounded p-1"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </TableCell>
                {availablePages.map((page) => (
                  <TableCell key={page.path}>
                    <Checkbox
                      checked={userPermissions[user.id]?.pages[page.path] || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(user.id, page.path, checked as boolean)
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
