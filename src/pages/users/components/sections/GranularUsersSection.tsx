
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GranularPermissionsTable } from "../GranularPermissionsTable";
import { useGranularPermissions } from "../../hooks/permissions/useGranularPermissions";

export function GranularUsersSection() {
  const {
    usersWithPermissions,
    isLoading,
    error,
    updateUserPermission,
    updateUserRole,
    refetch
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
            <AlertDescription className="flex items-center justify-between">
              <span>Error al cargar permisos granulares: {error instanceof Error ? error.message : 'Error desconocido'}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión Granular de Permisos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Controla permisos específicos para cada usuario de forma individual
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {usersWithPermissions && usersWithPermissions.length > 0 ? (
          <GranularPermissionsTable
            users={usersWithPermissions}
            onUpdatePermission={updateUserPermission}
            onUpdateRole={updateUserRole}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron usuarios para gestionar
          </div>
        )}
      </CardContent>
    </Card>
  );
}
