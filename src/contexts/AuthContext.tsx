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
      console.log("🔐 [AUTH DEBUG] === CHECKING ADMIN STATUS ===");
      console.log("🔐 [AUTH DEBUG] User ID:", userId);
      
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: userId });
      
      console.log("🔐 [AUTH DEBUG] is_admin RPC result:");
      console.log("🔐 [AUTH DEBUG] - data:", data);
      console.log("🔐 [AUTH DEBUG] - error:", error);
      
      if (error) {
        console.error("❌ [AUTH DEBUG] Error in is_admin RPC:", error);
        throw error;
      }
      
      const adminStatus = !!data;
      console.log("🔐 [AUTH DEBUG] Final admin status:", adminStatus);
      setIsAdmin(adminStatus);
      
      // También hacer consulta directa para verificar
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select('role')
        .eq('user_id', userId);
      
      console.log("🔐 [AUTH DEBUG] Direct company_users query:");
      console.log("🔐 [AUTH DEBUG] - data:", companyUsersData);
      console.log("🔐 [AUTH DEBUG] - error:", companyUsersError);
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('user_id')
        .eq('user_id', userId);
      
      console.log("🔐 [AUTH DEBUG] Direct companies query:");
      console.log("🔐 [AUTH DEBUG] - data:", companiesData);
      console.log("🔐 [AUTH DEBUG] - error:", companiesError);
      
    } catch (error) {
      console.error('❌ [AUTH DEBUG] Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔐 [AUTH DEBUG] Initial session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("🔐 [AUTH DEBUG] Auth state change:", _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }

      // Si la sesión existe pero no hay token de actualización, cerrar sesión
      if (session && !session.refresh_token) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // Verificar que tenemos un token de actualización válido
    if (!data.session?.refresh_token) {
      throw new Error("No se pudo obtener un token de actualización válido");
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  const updateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail,
      });
      
      if (error) {
        throw error;
      }

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
