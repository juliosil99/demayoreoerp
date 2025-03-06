
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
    console.log("Login: Checking user status for:", { userId, userEmail });
    
    // Check if user was invited
    console.log("Login: Checking if user was invited...");
    const { data: invitationData, error: invitationError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", userEmail)
      .eq("status", "completed")
      .maybeSingle();
    
    console.log("Login: Invitation query result:", invitationData);
    
    if (invitationError) {
      console.error("Login: Error checking invitation:", invitationError);
    }
    
    const wasInvited = !!invitationData;
    console.log("Login: Was user invited?", wasInvited);
    
    // If user was invited, they don't need to configure company
    if (wasInvited) {
      console.log("Login: User was invited, redirecting to dashboard");
      navigate("/dashboard");
      return;
    }
    
    // Check if company exists for this user
    console.log("Login: Checking if company exists for this user...");
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    console.log("Login: Company check result:", company);
    
    if (companyError && companyError.code !== "PGRST116") {
      console.error("Login: Error checking company:", companyError);
    }
    
    // Check if any company exists at all
    console.log("Login: Checking if any company exists...");
    const { data: anyCompany, error: anyCompanyError } = await supabase
      .from("companies")
      .select("*")
      .limit(1);
    
    console.log("Login: Any company check result:", anyCompany);
    
    if (anyCompanyError) {
      console.error("Login: Error checking any company:", anyCompanyError);
    }
    
    if (company || (anyCompany && anyCompany.length > 0)) {
      console.log("Login: Company exists, redirecting to dashboard");
      navigate("/dashboard");
    } else {
      console.log("Login: No company found, redirecting to company setup");
      navigate("/company-setup");
    }
  };

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log("Login: Starting sign up process...");
        await signUp(email, password);
        toast.success("Cuenta creada exitosamente! Por favor, inicia sesión.");
      } else {
        console.log("Login: Starting sign in process...");
        await signIn(email, password);
        console.log("Login: Sign in successful, getting user...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Login: User authenticated successfully:", user.id);
          await checkUserStatus(user.id, user.email || "");
        } else {
          console.log("Login: No user found after authentication");
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
