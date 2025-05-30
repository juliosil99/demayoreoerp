
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useAccountBalances } from "@/hooks/financial-reporting/useAccountBalances";

interface AccountData {
  id: string;
  code: string;
  name: string;
  account_type: string;
}

const accountTypeFilters = {
  assets: ['asset', 'current_asset', 'fixed_asset'],
  liabilities: ['liability', 'current_liability', 'long_term_liability'],
  equity: ['equity'],
  revenue: ['revenue'],
  expenses: ['expense']
};

export function useAccountTypeData(accountType: string, periodId: string) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  
  const { 
    balances, 
    isLoading: balancesLoading, 
    saveAccountBalance 
  } = useAccountBalances(periodId);
  
  // State to track account balance inputs
  const [balanceInputs, setBalanceInputs] = useState<{[key: string]: string}>({});
  
  // Load chart of accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('code', { ascending: true });
          
        if (error) throw error;
        
        setAccounts(data || []);
      } catch (err) {
        console.error('Error fetching chart of accounts:', err);
        toast({
          title: "Error",
          description: "No se pudo cargar el catálogo de cuentas.",
          variant: "destructive"
        });
      } finally {
        setAccountsLoading(false);
      }
    };
    
    fetchAccounts();
  }, [user]);
  
  // Initialize balance inputs from balances
  useEffect(() => {
    if (balances) {
      const initialBalances: {[key: string]: string} = {};
      balances.forEach(balance => {
        initialBalances[balance.account_id] = balance.balance.toString();
      });
      setBalanceInputs(initialBalances);
    }
  }, [balances]);
  
  // Handle input change
  const handleInputChange = (accountId: string, value: string) => {
    setBalanceInputs(prev => ({
      ...prev,
      [accountId]: value
    }));
  };
  
  // Handle save balance
  const handleSaveBalance = async (accountId: string) => {
    try {
      const balance = parseFloat(balanceInputs[accountId]);
      if (isNaN(balance)) {
        toast({
          title: "Error",
          description: "El saldo debe ser un número válido.",
          variant: "destructive"
        });
        return;
      }
      
      await saveAccountBalance({
        account_id: accountId,
        period_id: periodId,
        balance
      });
      
    } catch (err) {
      console.error('Error saving balance:', err);
      toast({
        title: "Error",
        description: "No se pudo guardar el saldo.",
        variant: "destructive"
      });
    }
  };
  
  // Filter accounts by type using the predefined filters
  const filteredAccounts = useMemo(() => {
    if (accountsLoading || !accountType || !accounts.length) {
      return [];
    }
    
    const filters = accountTypeFilters[accountType as keyof typeof accountTypeFilters];
    if (!filters) {
      return [];
    }
    
    return accounts.filter(acc => filters.includes(acc.account_type));
  }, [accounts, accountType, accountsLoading]);
  
  return {
    accounts: filteredAccounts,
    balances,
    balanceInputs,
    handleInputChange,
    handleSaveBalance,
    accountsLoading,
    balancesLoading
  };
}
