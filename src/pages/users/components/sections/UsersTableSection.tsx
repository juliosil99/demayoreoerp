
import { UsersTable } from "../UsersTable";
import { Profile, UserPermissions } from "../../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface UsersTableSectionProps {
  profiles: Profile[] | null;
  userPermissions: { [key: string]: UserPermissions };
  onPermissionChange: (userId: string, page: string, checked: boolean) => void;
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
  currentUserId?: string;
}

export function UsersTableSection({
  profiles,
  userPermissions,
  onPermissionChange,
  onRoleChange,
  currentUserId
}: UsersTableSectionProps) {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-md border mt-8 overflow-x-auto">
      <UsersTable
        profiles={profiles}
        userPermissions={userPermissions}
        onPermissionChange={onPermissionChange}
        onRoleChange={onRoleChange}
        isMobile={isMobile}
        currentUserId={currentUserId}
      />
    </div>
  );
}
