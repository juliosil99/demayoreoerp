
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserInvitations } from "../hooks/useUserInvitations";

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
    <form onSubmit={handleSubmit} className="flex gap-4 items-end mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Email del usuario</label>
        <Input
          type="email"
          placeholder="usuario@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="w-48">
        <label className="block text-sm font-medium mb-1">Rol</label>
        <Select value={role} onValueChange={(value: "admin" | "user") => setRole(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isInviting}>
        {isInviting ? "Invitando..." : "Invitar Usuario"}
      </Button>
    </form>
  );
}
