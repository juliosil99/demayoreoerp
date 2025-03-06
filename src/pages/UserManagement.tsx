
import { useEffect, useState } from "react";
import { UsersTable } from "./users/components/UsersTable";
import { InviteUserForm } from "./users/components/InviteUserForm";
import { PendingInvitations } from "./users/components/PendingInvitations";
import { useUserPermissions } from "./users/hooks/useUserPermissions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange
  } = useUserPermissions();
  
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading) {
      if (!user) {
        toast.error("Necesitas iniciar sesión para acceder a esta página");
        navigate("/login");
        return;
      }
      
      if (!isAdmin) {
        toast.error("No tienes permisos para acceder a esta página");
        navigate("/dashboard");
        return;
      }
      
      setIsCheckingPermission(false);
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading || isCheckingPermission) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
        <div className="space-y-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="rounded-md border p-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
      
      <InviteUserForm />
      <PendingInvitations />
      
      <div className="rounded-md border mt-8">
        <UsersTable
          profiles={profiles}
          userPermissions={userPermissions}
          onPermissionChange={handlePermissionChange}
          onRoleChange={handleRoleChange}
        />
      </div>
    </div>
  );
}
