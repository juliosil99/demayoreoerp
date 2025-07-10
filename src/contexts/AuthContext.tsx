import * as React from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const prevUserIdRef = React.useRef<string | null>(null);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: userId });
      
      if (error) {
        console.error('❌ Error checking admin status:', error);
        throw error;
      }
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      
    } catch (error) {
      console.error('💥 Exception checking admin status:', error);
      setIsAdmin(false);
    }
  };

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUserId = session?.user?.id;
      const previousUserId = prevUserIdRef.current;

      // Check if user changed
      if (currentUserId !== previousUserId) {
        console.log('🔄 User changed from', previousUserId, 'to', currentUserId);
        // Invalidate all dashboard-related queries when user changes
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey[0] as string;
            return queryKey?.includes('optimized-dashboard') || 
                   queryKey?.includes('optimized-channel') || 
                   queryKey?.includes('optimized-sales');
          }
        });
        prevUserIdRef.current = currentUserId || null;
      }

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

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    
    // Verificar que tenemos un token de actualización válido
    if (!data.session?.refresh_token) {
      console.error('❌ No refresh token received');
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
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out user:', user?.id);
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    
    // Clear all cached data to prevent data bleeding
    queryClient.clear();
    prevUserIdRef.current = null;
    
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
        console.error('❌ Email update error:', error);
        throw error;
      }

      toast.success("Se ha enviado un enlace de confirmación a tu nuevo correo electrónico");
    } catch (error: any) {
      console.error('💥 Email update exception:', error);
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
