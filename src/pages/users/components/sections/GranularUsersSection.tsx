
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { GranularPermissionsTable } from "../GranularPermissionsTable";
import { useGranularPermissions } from "../../hooks/permissions/useGranularPermissions";

export function GranularUsersSection() {
  const {
    usersWithPermissions,
    isLoading,
    error,
    updateUserPermission,
    updateUserRole
  } = useGranularPermissions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión Granular de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión Granular de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar permisos granulares: {error instanceof Error ? error.message : 'Error desconocido'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión Granular de Permisos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Controla permisos específicos para cada usuario de forma individual
        </p>
      </CardHeader>
      <CardContent>
        <GranularPermissionsTable
          users={usersWithPermissions || []}
          onUpdatePermission={updateUserPermission}
          onUpdateRole={updateUserRole}
        />
      </CardContent>
    </Card>
  );
}
