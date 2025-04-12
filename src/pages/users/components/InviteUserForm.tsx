
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserInvitations } from "../hooks/useUserInvitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const { inviteUser, isInviting } = useUserInvitations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    await inviteUser(email, role);
    setEmail("");
    setRole("user");
  };

  return (
    <Card className="mb-6">
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-base sm:text-lg">Invitar Nuevo Usuario</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium mb-1">Email del usuario</label>
            <Input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs sm:text-sm font-medium mb-1">Rol</label>
            <Select value={role} onValueChange={(value: "admin" | "user") => setRole(value)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            disabled={isInviting}
            className="mt-2 sm:mt-0"
          >
            {isInviting ? "Invitando..." : "Invitar Usuario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
