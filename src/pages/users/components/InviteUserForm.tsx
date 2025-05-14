
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserInvitations } from "../hooks/useUserInvitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Company {
  id: string;
  nombre: string;
}

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [companyId, setCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const { inviteUser, isInviting } = useUserInvitations();
  const { user } = useAuth();

  useEffect(() => {
    const loadUserCompanies = async () => {
      if (!user) return;

      try {
        // Get companies where the current user is an admin
        const { data: adminCompanies, error: adminError } = await supabase
          .from("company_users")
          .select("companies:company_id(id, nombre)")
          .eq("user_id", user.id)
          .eq("role", "admin");

        if (adminError) throw adminError;
        
        if (adminCompanies && adminCompanies.length > 0) {
          const formattedCompanies = adminCompanies.map((item: any) => ({
            id: item.companies.id,
            nombre: item.companies.nombre
          }));
          
          setCompanies(formattedCompanies);
          
          // Set the first company as default if no company is selected
          if (!companyId && formattedCompanies.length > 0) {
            setCompanyId(formattedCompanies[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error loading companies:", error);
      }
    };

    loadUserCompanies();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !companyId) return;
    
    await inviteUser(email, role, companyId);
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
          
          <div className="w-full sm:w-40">
            <label className="block text-xs sm:text-sm font-medium mb-1">Empresa</label>
            <Select 
              value={companyId} 
              onValueChange={setCompanyId}
              disabled={companies.length === 0}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-32">
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
            disabled={isInviting || !companyId || companies.length === 0}
            className="mt-2 sm:mt-0"
          >
            {isInviting ? "Invitando..." : "Invitar Usuario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
