
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimplifiedPermissions } from "./users/hooks/permissions/useSimplifiedPermissions";
import { useInvitationExpiration } from "./users/hooks/invitations/useInvitationExpiration";
import {
  UserInvitationSection,
  PendingInvitationsSection,
  UsersTableSection
} from "./users/components/sections";
import { useAuth } from "@/contexts/AuthContext";
import { SimplifiedUsersTable } from "./users/components/SimplifiedUsersTable";

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const {
    profiles,
    isLoading,
    error,
    userPermissions,
    handleRoleChange,
    currentUserId,
    refetchData
  } = useSimplifiedPermissions();

  // Initialize invitation expiration checking
  useInvitationExpiration();

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

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-2 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Administración de Usuarios</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Acceso Restringido</AlertTitle>
          <AlertDescription>
            Solo los administradores pueden acceder a la gestión completa de usuarios.
          </AlertDescription>
        </Alert>

        <div className="rounded-md border p-4">
          <h3 className="text-lg font-medium mb-4">Mi Perfil</h3>
          <SimplifiedUsersTable
            profiles={profiles?.filter(p => p.id === currentUserId) || []}
            userPermissions={userPermissions}
            onRoleChange={handleRoleChange}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Administración de Usuarios</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refetchData}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </div>
      
      <UserInvitationSection />
      <PendingInvitationsSection />
      
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Usuarios de la Empresa</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los roles y permisos de los usuarios en tu empresa
          </p>
        </div>
        <div className="p-4">
          <SimplifiedUsersTable
            profiles={profiles || []}
            userPermissions={userPermissions}
            onRoleChange={handleRoleChange}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
