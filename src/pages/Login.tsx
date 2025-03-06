
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const checkUserStatus = async (userId: string, userEmail: string) => {
    // Check if user was invited
    const { data: invitationData } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", userEmail)
      .eq("status", "completed")
      .maybeSingle();
    
    const wasInvited = !!invitationData;
    
    // If user was invited, they don't need to configure company
    if (wasInvited) {
      navigate("/dashboard");
      return;
    }
    
    // Check if company exists for this user
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    // Check if any company exists at all
    const { data: anyCompany } = await supabase
      .from("companies")
      .select("*")
      .limit(1);
    
    if (company || (anyCompany && anyCompany.length > 0)) {
      navigate("/dashboard");
    } else {
      navigate("/company-setup");
    }
  };

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Cuenta creada exitosamente! Por favor, inicia sesión.");
      } else {
        await signIn(email, password);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await checkUserStatus(user.id, user.email || "");
        }
        toast.success("Inició sesión exitosamente!");
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      toast.error(error instanceof Error ? error.message : "Error de autenticación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenido de nuevo</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
              >
                Crear Cuenta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
