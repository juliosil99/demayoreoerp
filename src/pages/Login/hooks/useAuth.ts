
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthActions = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    console.log("useAuthActions: Starting sign in process...");
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      console.log("useAuthActions: Sign in successful");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("useAuthActions: No user found after authentication");
        throw new Error("No se pudo obtener información del usuario");
      }
      
      console.log("useAuthActions: User authenticated successfully:", user.id);
      return user;
    } catch (error) {
      console.error("useAuthActions Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error de autenticación");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log("useAuthActions: Starting sign up process...");
    setIsLoading(true);
    
    try {
      await signUp(email, password);
      toast.success("Cuenta creada exitosamente! Por favor, inicia sesión.");
    } catch (error) {
      console.error("useAuthActions Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al registrar usuario");
      }
      throw error;
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
    handleSignIn,
    handleSignUp
  };
};
