
import { UsersTable } from "./users/components/UsersTable";
import { InviteUserForm } from "./users/components/InviteUserForm";
import { PendingInvitations } from "./users/components/PendingInvitations";
import { useUserPermissions } from "./users/hooks/useUserPermissions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function UserManagement() {
  const {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange
  } = useUserPermissions();

  if (isLoading) {
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
