
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { UsersTable } from "../UsersTable";
import { Profile, UserPermissions } from "../../types";

interface UsersTableSectionProps {
  profiles: Profile[];
  userPermissions: { [key: string]: UserPermissions };
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
  currentUserId?: string;
}

export function UsersTableSection({ 
  profiles, 
  userPermissions, 
  onRoleChange, 
  currentUserId 
}: UsersTableSectionProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Listen for window resize to toggle mobile view
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card>
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-base sm:text-lg">Usuarios de la Empresa</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <UsersTable
          profiles={profiles}
          userPermissions={userPermissions}
          onRoleChange={onRoleChange}
          isMobile={isMobile}
          currentUserId={currentUserId}
        />
      </CardContent>
    </Card>
  );
}
