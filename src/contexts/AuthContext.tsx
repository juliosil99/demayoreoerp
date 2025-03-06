
import * as React from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: userId });
      
      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  React.useEffect(() => {
    // Get initial session
    console.log("AuthProvider: Getting initial session...");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: Initial session:", session ? "Found" : "Not found");
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("AuthProvider: Initial user ID:", session.user.id);
        console.log("AuthProvider: Initial user email:", session.user.email);
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    console.log("AuthProvider: Setting up auth state change listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("AuthProvider: Auth state changed, event:", _event);
      console.log("AuthProvider: New session:", session ? "Found" : "Not found");
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log("AuthProvider: User ID after auth change:", session.user.id);
        console.log("AuthProvider: User email after auth change:", session.user.email);
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }

      // Si la sesión existe pero no hay token de actualización, cerrar sesión
      if (session && !session.refresh_token) {
        console.log("AuthProvider: Session has no refresh token, signing out");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Signing in user:", email);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("AuthProvider: Sign in error:", error);
      throw error;
    }
    
    console.log("AuthProvider: Sign in successful, session:", data.session ? "Found" : "Not found");
    
    // Verificar que tenemos un token de actualización válido
    if (!data.session?.refresh_token) {
      console.error("AuthProvider: No refresh token in session");
      throw new Error("No se pudo obtener un token de actualización válido");
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("AuthProvider: Signing up user:", email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("AuthProvider: Sign up error:", error);
      throw error;
    }
    console.log("AuthProvider: Sign up successful");
  };

  const signOut = async () => {
    console.log("AuthProvider: Signing out user");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("AuthProvider: Sign out error:", error);
      throw error;
    }
    console.log("AuthProvider: Sign out successful");
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  const updateEmail = async (newEmail: string) => {
    try {
      console.log("AuthProvider: Updating email to:", newEmail);
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail,
      });
      
      if (error) {
        console.error("AuthProvider: Update email error:", error);
        throw error;
      }

      console.log("AuthProvider: Email update successful");
      toast.success("Se ha enviado un enlace de confirmación a tu nuevo correo electrónico");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, signIn, signUp, signOut, updateEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
