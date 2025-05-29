
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvitationExpiration } from "./users/hooks/invitations/useInvitationExpiration";
import { useInvitationSync } from "./users/hooks/invitations/useInvitationSync";
import {
  UserInvitationSection,
  PendingInvitationsSection,
} from "./users/components/sections";
import { GranularUsersSection } from "./users/components/sections/GranularUsersSection";
import { useAuth } from "@/contexts/AuthContext";

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const { syncInvitationStatuses, isSyncing } = useInvitationSync();

  // Initialize invitation expiration checking
  useInvitationExpiration();

  const handleSyncInvitations = async () => {
    await syncInvitationStatuses();
  };

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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Administración de Usuarios</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSyncInvitations}
            disabled={isSyncing}
          >
            <RotateCcw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        <UserInvitationSection />
        <PendingInvitationsSection />
        <GranularUsersSection />
      </div>
    </div>
  );
}
