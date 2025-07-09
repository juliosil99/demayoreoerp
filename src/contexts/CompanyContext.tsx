import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Company {
  id: string;
  nombre: string;
  rfc: string;
  regimen_fiscal: string;
  codigo_postal: string;
  direccion?: string;
  telefono?: string;
  created_at?: string;
  user_id: string;
}

interface CompanyContextType {
  activeCompany: Company | null;
  availableCompanies: Company[];
  setActiveCompany: (company: Company) => void;
  isLoading: boolean;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserCompanies = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get companies where user is owner
      const { data: ownedCompanies, error: ownedError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id);

      // Get companies where user is member
      const { data: memberCompanies, error: memberError } = await supabase
        .from("company_users")
        .select("companies(*)")
        .eq("user_id", user.id);

      if (ownedError) throw ownedError;
      if (memberError) throw memberError;

      const allCompanies: Company[] = [
        ...(ownedCompanies || []),
        ...(memberCompanies?.map((cu: any) => cu.companies) || []).filter(Boolean)
      ];

      // Remove duplicates
      const uniqueCompanies = allCompanies.filter((company, index, self) => 
        index === self.findIndex(c => c.id === company.id)
      );

      setAvailableCompanies(uniqueCompanies);

      // Set active company from localStorage or default to first available
      const savedCompanyId = localStorage.getItem("activeCompanyId");
      const savedCompany = uniqueCompanies.find(c => c.id === savedCompanyId);
      
      if (savedCompany) {
        setActiveCompanyState(savedCompany);
      } else if (uniqueCompanies.length > 0) {
        setActiveCompanyState(uniqueCompanies[0]);
        localStorage.setItem("activeCompanyId", uniqueCompanies[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      toast.error("Error al cargar las empresas");
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveCompany = (company: Company) => {
    setActiveCompanyState(company);
    localStorage.setItem("activeCompanyId", company.id);
    toast.success(`Cambiado a empresa: ${company.nombre}`);
  };

  const refreshCompanies = async () => {
    await fetchUserCompanies();
  };

  useEffect(() => {
    fetchUserCompanies();
  }, [user?.id]);

  // Clear company data when user logs out
  useEffect(() => {
    if (!user) {
      setActiveCompanyState(null);
      setAvailableCompanies([]);
      localStorage.removeItem("activeCompanyId");
    }
  }, [user]);

  return (
    <CompanyContext.Provider value={{
      activeCompany,
      availableCompanies,
      setActiveCompany,
      isLoading,
      refreshCompanies
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};