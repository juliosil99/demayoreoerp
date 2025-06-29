
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
    
    try {
      // First, check if user has their own company
      console.log("Login: Checking if user has their own company...");
      const { data: userCompany, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      console.log("Login: User company check result:", userCompany);
      
      if (companyError) {
        console.error("Login: Error checking user company:", companyError);
        throw companyError;
      }
      
      if (userCompany) {
        console.log("Login: User has their own company, redirecting to homepage");
        navigate("/");
        return;
      }
      
      // If user doesn't have their own company, check if they were invited
      console.log("Login: User doesn't have a company, checking if invited...");
      
      // Check for ALL invitations related to this email
      const { data: invitations, error: invitationError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("email", userEmail);
      
      console.log("Login: All invitations for this email:", invitations);
      
      if (invitationError) {
        console.error("Login: Error checking invitations:", invitationError);
        throw invitationError;
      }
      
      // Check for completed invitations
      const completedInvitation = invitations?.find(inv => inv.status === 'completed');
      
      if (completedInvitation) {
        console.log("Login: User has a completed invitation, redirecting to homepage");
        navigate("/");
        return;
      }
      
      // Check for pending invitations
      const pendingInvitation = invitations?.find(inv => inv.status === 'pending');
      
      if (pendingInvitation) {
        console.log("Login: User has a pending invitation, redirecting to registration");
        navigate(`/register?token=${pendingInvitation.invitation_token}`);
        return;
      }
      
      // Check for expired invitations
      const expiredInvitation = invitations?.find(inv => inv.status === 'expired');
      
      if (expiredInvitation) {
        console.log("Login: User has an expired invitation");
        toast.error("Tu invitación ha expirado. Contacta al administrador para que la reactive.");
      }
      
      // Check if any company exists at all
      console.log("Login: No invitation found, checking if any company exists...");
      const { data: anyCompany, error: anyCompanyError } = await supabase
        .from("companies")
        .select("count");
      
      console.log("Login: Any company check result:", anyCompany);
      
      if (anyCompanyError) {
        console.error("Login: Error checking for any company:", anyCompanyError);
        throw anyCompanyError;
      }
      
      // If no companies exist at all, user should be able to create one
      if (!anyCompany || anyCompany.length === 0 || anyCompany[0].count === 0) {
        console.log("Login: No company found, redirecting to company setup");
        navigate("/company-setup");
        return;
      }
      
      // Companies exist but this user doesn't have one and wasn't invited
      console.log("Login: Companies exist but none for this user and not invited");
      toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
      // Stay on the current page and don't redirect
      
    } catch (err) {
      console.error("Login: Error in checkUserStatus:", err);
      toast.error("Error verificando el estado del usuario");
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
        setIsLoading(false);
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
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error de autenticación");
      }
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
