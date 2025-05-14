
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    error,
    userPermissions,
    handlePermissionChange,
    handleRoleChange,
    currentUserId,
    refetchData
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

  if (error) {
    return (
      <div className="container mx-auto p-2 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Administración de Usuarios</h1>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Ocurrió un error al cargar los datos de usuarios. 
            {error instanceof Error && `: ${error.message}`}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => refetchData && refetchData()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Administración de Usuarios</h1>
      
      <UserInvitationSection />
      <PendingInvitationsSection />
      
      <UsersTableSection
        profiles={profiles || []}
        userPermissions={userPermissions}
        onPermissionChange={handlePermissionChange}
        onRoleChange={handleRoleChange}
        currentUserId={currentUserId}
      />
    </div>
  );
}
