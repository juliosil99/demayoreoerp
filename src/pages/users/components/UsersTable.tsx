
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface UsersTableProps {
  profiles: Profile[] | null;
  userPermissions: { [key: string]: UserPermissions };
  onPermissionChange: (userId: string, page: string, checked: boolean) => void;
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
  isMobile?: boolean;
}

export const UsersTable = memo(function UsersTable({ 
  profiles, 
  userPermissions, 
  onPermissionChange, 
  onRoleChange,
  isMobile = false
}: UsersTableProps) {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="mb-4">
            <CardContent className="p-4">
              <div className="font-medium mb-2 text-sm">{profile.email}</div>
              
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1 block">Rol:</label>
                <Select
                  value={userPermissions[profile.id]?.role || 'user'}
                  onValueChange={(value) => onRoleChange(profile.id, value as 'admin' | 'user')}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 mt-3">
                <div className="text-xs font-medium text-muted-foreground">Permisos:</div>
                {availablePages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <span className="text-sm">{page.label}</span>
                    <Checkbox
                      checked={userPermissions[profile.id]?.pages[page.path] || false}
                      onCheckedChange={(checked) => 
                        onPermissionChange(profile.id, page.path, checked as boolean)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            {availablePages.map((page) => (
              <TableHead key={page.path} className="text-center whitespace-nowrap">{page.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="whitespace-nowrap">{profile.email}</TableCell>
              <TableCell>
                <Select
                  value={userPermissions[profile.id]?.role || 'user'}
                  onValueChange={(value) => onRoleChange(profile.id, value as 'admin' | 'user')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              {availablePages.map((page) => (
                <TableCell key={page.path} className="text-center">
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
    </div>
  );
});
