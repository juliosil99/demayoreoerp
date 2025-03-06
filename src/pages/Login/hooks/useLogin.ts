
import { useState } from "react";
import { toast } from "sonner";
import { useAuthActions } from "./useAuth";
import { useUserStatus } from "./useUserStatus";

export const useLogin = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleSignIn,
    handleSignUp
  } = useAuthActions();
  
  const { checkUserStatus } = useUserStatus();

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean = false) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        console.log("Login: Starting sign up process...");
        await handleSignUp();
      } else {
        console.log("Login: Starting sign in process...");
        const user = await handleSignIn();
        
        if (user) {
          await checkUserStatus(user.id, user.email || "");
        }
        toast.success("Inició sesión exitosamente!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      // Error messages are already handled in the individual hooks
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
