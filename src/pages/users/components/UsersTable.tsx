
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Profile, UserPermissions, availablePages } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface UsersTableProps {
  profiles: Profile[] | null;
  userPermissions: { [key: string]: UserPermissions };
  userCompanies: { [key: string]: { companyName: string, role: string }[] };
  onPermissionChange: (userId: string, page: string, checked: boolean) => void;
  onRoleChange: (userId: string, role: 'admin' | 'user') => void;
}

export function UsersTable({ 
  profiles, 
  userPermissions, 
  userCompanies,
  onPermissionChange, 
  onRoleChange 
}: UsersTableProps) {
  const { currentCompany } = useAuth();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Empresas</TableHead>
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
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {userCompanies[profile.id]?.map((company, idx) => (
                  <Badge 
                    key={idx} 
                    variant={company.companyName === currentCompany?.nombre ? "default" : "outline"}
                    className="text-xs"
                  >
                    {company.companyName} ({company.role === 'admin' ? 'Admin' : 'Usuario'})
                  </Badge>
                ))}
                {(!userCompanies[profile.id] || userCompanies[profile.id].length === 0) && (
                  <span className="text-sm text-muted-foreground">Sin empresas</span>
                )}
              </div>
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
  );
}
