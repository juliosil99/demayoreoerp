
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Profile, UserPermissions, availablePages } from "../types";

interface UsersTableProps {
  profiles: Profile[] | null;
  userPermissions: { [key: string]: UserPermissions };
  onPermissionChange: (userId: string, page: string, checked: boolean) => void;
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
}

export function UsersTable({ 
  profiles, 
  userPermissions, 
  onPermissionChange, 
  onRoleChange 
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          {availablePages.map((page) => (
            <TableHead key={page.path}>{page.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles?.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.email}</TableCell>
            <TableCell>
              <select
                value={userPermissions[profile.id]?.role || 'user'}
                onChange={(e) => onRoleChange(profile.id, e.target.value as 'admin' | 'user')}
                className="border rounded p-1"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </TableCell>
            {availablePages.map((page) => (
              <TableCell key={page.path}>
                <Checkbox
                  checked={userPermissions[profile.id]?.pages[page.path] || false}
                  onCheckedChange={(checked) => 
                    onPermissionChange(profile.id, page.path, checked as boolean)
                  }
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
