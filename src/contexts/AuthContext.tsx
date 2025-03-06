import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import { Session, User, AuthResponse } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  userCompanies: any[];
  currentCompany: any | null;
  setCurrentCompany: (company: any) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signIn: async () => ({ data: { session: null, user: null }, error: null }),
  signOut: async () => {},
  refreshSession: async () => {},
  userCompanies: [],
  currentCompany: null,
  setCurrentCompany: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [currentCompany, setCurrentCompany] = useState<any | null>(null);

  const fetchUserCompanies = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("company_users")
        .select(`
          role,
          company:company_id (
            id,
            nombre,
            rfc,
            codigo_postal,
            regimen_fiscal
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      
      const companies = data
        ?.map(item => ({ ...item.company, userRole: item.role }))
        .filter(Boolean) || [];
      
      setUserCompanies(companies);
      
      // Set current company to the first one if not already set
      if (companies.length > 0 && !currentCompany) {
        setCurrentCompany(companies[0]);
      }
      
      return companies;
    } catch (error) {
      console.error("Error fetching user companies:", error);
      return [];
    }
  };

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      try {
        // Use the PostgreSQL function to check admin status
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: userId
        });

        if (error) throw error;
        setIsAdmin(!!data);
        return !!data;
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        return false;
      }
    };

    const setupUser = async (currentUser: User) => {
      await checkAdminStatus(currentUser.id);
      await fetchUserCompanies(currentUser.id);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setupUser(session.user);
      }
      
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setupUser(session.user);
        } else {
          setIsAdmin(false);
          setUserCompanies([]);
          setCurrentCompany(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setUserCompanies([]);
    setCurrentCompany(null);
  };

  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    
    if (data.session?.user) {
      await checkAdminStatus(data.session.user.id);
      await fetchUserCompanies(data.session.user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        signIn,
        signOut,
        refreshSession,
        userCompanies,
        currentCompany,
        setCurrentCompany
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
