
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPermissions } from "./users/hooks/useUserPermissions";
import {
  UserInvitationSection,
  PendingInvitationsSection,
  UsersTableSection
} from "./users/components/sections";

export default function UserManagement() {
  const {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange,
    currentUserId
  } = useUserPermissions();

  if (isLoading) {
    return (
      <div className="container mx-auto p-2 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Administración de Usuarios</h1>
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
    <div className="container mx-auto p-2 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Administración de Usuarios</h1>
      
      <UserInvitationSection />
      <PendingInvitationsSection />
      
      <UsersTableSection
        profiles={profiles}
        userPermissions={userPermissions}
        onPermissionChange={handlePermissionChange}
        onRoleChange={handleRoleChange}
        currentUserId={currentUserId}
      />
    </div>
  );
}
