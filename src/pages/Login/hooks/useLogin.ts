
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const checkUserStatus = async (userId: string, userEmail: string) => {
    console.log("Login: Checking user status for:", { userId, userEmail });
    
    try {
      // First, check if the user has a role
      console.log("Login: Checking if user has a role...");
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (roleError) {
        console.error("Login: Error checking user role:", roleError);
        throw roleError;
      }
      
      if (userRole) {
        console.log("Login: User has role:", userRole.role);
        
        const { data: userCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (companyError) {
          console.error("Login: Error checking user company:", companyError);
          throw companyError;
        }
        
        if (userCompany) {
          console.log("Login: User has their own company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        const { data: anyCompany } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
        
        if (anyCompany && anyCompany.length > 0) {
          console.log("Login: Companies exist, user has role but no company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        } else {
          console.log("Login: No company found, redirecting to company setup");
          navigate("/company-setup");
          return;
        }
      }
      
      const { data: invitations, error: invitationError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("email", userEmail);
      
      if (invitationError) {
        console.error("Login: Error checking invitations:", invitationError);
        throw invitationError;
      }
      
      const completedInvitation = invitations?.find(inv => inv.status === 'completed');
      
      if (completedInvitation) {
        console.log("Login: Found completed invitation but no role, creating role now");
        
        const { error: createRoleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: completedInvitation.role || 'user'
          });
          
        if (createRoleError) {
          console.error("Login: Error creating role:", createRoleError);
          throw createRoleError;
        }
        
        console.log("Login: Role created, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }
      
      const pendingInvitation = invitations?.find(inv => inv.status === 'pending');
      
      if (pendingInvitation) {
        console.log("Login: User has a pending invitation, redirecting to registration");
        navigate(`/register?token=${pendingInvitation.invitation_token}`);
        return;
      }
      
      const expiredInvitation = invitations?.find(inv => inv.status === 'expired');
      
      if (expiredInvitation) {
        console.log("Login: User has an expired invitation");
        toast.error("Tu invitación ha expirado. Contacta al administrador para que la reactive.");
        return;
      }
      
      const { data: anyCompany } = await supabase
        .from("companies")
        .select("*")
        .limit(1);
      
      if (anyCompany && anyCompany.length > 0) {
        console.log("Login: Companies exist but none for this user and not invited");
        toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
        return;
      } else {
        console.log("Login: No company found, redirecting to company setup");
        navigate("/company-setup");
      }
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
      console.error("Login Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error de autenticación");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleSubmit
  };
};
