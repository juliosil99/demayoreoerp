
import { UsersTable } from "./users/components/UsersTable";
import { useUserPermissions } from "./users/hooks/useUserPermissions";

export default function UserManagement() {
  const {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange
  } = useUserPermissions();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
      <div className="rounded-md border">
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
