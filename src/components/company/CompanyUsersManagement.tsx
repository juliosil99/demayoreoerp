
import { useState } from "react";
import { useCompanyUsers } from "@/hooks/company/useCompanyUsers";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Mail } from "lucide-react";
import { toast } from "sonner";

interface CompanyUsersManagementProps {
  companyId: string;
}

export function CompanyUsersManagement({ companyId }: CompanyUsersManagementProps) {
  const { isAdmin } = useAuth();
  const {
    companyUsers,
    isLoading,
    isAddingUser,
    addUserToCompany,
    removeUserFromCompany,
    updateUserRole,
  } = useCompanyUsers(companyId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddUser = async () => {
    if (!userEmail.trim()) {
      toast.error("Por favor ingresa un correo electrónico");
      return;
    }

    try {
      await addUserToCompany.mutateAsync({ 
        email: userEmail.trim(), 
        role: userRole 
      });
      setUserEmail("");
      setUserRole("user");
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await removeUserFromCompany.mutateAsync(userToDelete);
      setUserToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Usuarios de la Empresa</CardTitle>
          <CardDescription>
            Gestiona los usuarios que tienen acceso a esta empresa
          </CardDescription>
        </div>
        {isAdmin && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Agregar Usuario</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Usuario a la Empresa</DialogTitle>
                <DialogDescription>
                  Ingresa el correo electrónico del usuario a agregar. Debe tener una cuenta registrada en el sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="correo@ejemplo.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Rol
                  </label>
                  <Select
                    value={userRole}
                    onValueChange={setUserRole}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddUser} 
                  disabled={isAddingUser || !userEmail.trim()}
                >
                  {isAddingUser ? "Agregando..." : "Agregar Usuario"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">Cargando usuarios...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Users className="h-8 w-8" />
                      <p>No hay usuarios asignados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                companyUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.user?.first_name || user.user?.last_name
                        ? `${user.user?.first_name || ""} ${user.user?.last_name || ""}`
                        : "Usuario"}
                    </TableCell>
                    <TableCell>{user.user?.email}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleRoleChange(user.user_id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="user">Usuario</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Administrador" : "Usuario"}
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user.user_id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas eliminar a este usuario de la empresa?
                El usuario perderá acceso a todos los datos de la empresa.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
