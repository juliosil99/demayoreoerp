
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
      console.log('👑 Checking admin status for user:', userId);
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: userId });
      
      if (error) {
        console.error('❌ Error checking admin status:', error);
        throw error;
      }
      
      const adminStatus = !!data;
      console.log('👑 Admin status result:', adminStatus);
      setIsAdmin(adminStatus);
      
    } catch (error) {
      console.error('💥 Exception checking admin status:', error);
      setIsAdmin(false);
    }
  };

  React.useEffect(() => {
    console.log('🔐 AuthProvider - Setting up auth state listener');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        accessToken: session?.access_token ? 'present' : 'missing',
        refreshToken: session?.refresh_token ? 'present' : 'missing'
      });
      
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
      console.log('🔐 Auth state change:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        accessToken: session?.access_token ? 'present' : 'missing',
        refreshToken: session?.refresh_token ? 'present' : 'missing'
      });
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }

      // Si la sesión existe pero no hay token de actualización, cerrar sesión
      if (session && !session.refresh_token) {
        console.log('⚠️ Session without refresh token, signing out');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      console.log('🔐 AuthProvider - Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    
    console.log('✅ Sign in successful:', {
      userId: data.user?.id,
      hasSession: !!data.session,
      hasRefreshToken: !!data.session?.refresh_token
    });
    
    // Verificar que tenemos un token de actualización válido
    if (!data.session?.refresh_token) {
      console.error('❌ No refresh token received');
      throw new Error("No se pudo obtener un token de actualización válido");
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('📝 Attempting sign up for:', email);
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
    console.log('✅ Sign up successful');
  };

  const signOut = async () => {
    console.log('🚪 Attempting sign out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    console.log('✅ Sign out successful');
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  const updateEmail = async (newEmail: string) => {
    try {
      console.log('📧 Updating email to:', newEmail);
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail,
      });
      
      if (error) {
        console.error('❌ Email update error:', error);
        throw error;
      }

      console.log('✅ Email update successful');
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
