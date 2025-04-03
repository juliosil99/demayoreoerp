
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ForecastHistoricalData } from "@/types/cashFlow";
import { subMonths } from "date-fns";

export function useHistoricalData() {
  // Get the date 3 months ago for historical data
  const threeMonthsAgo = subMonths(new Date(), 3).toISOString().split('T')[0];
  
  // Fetch historical payables data
  const { 
    data: payables, 
    isLoading: isLoadingPayables 
  } = useQuery({
    queryKey: ['historical-payables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .gte('due_date', threeMonthsAgo);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch historical receivables data
  const { 
    data: receivables, 
    isLoading: isLoadingReceivables 
  } = useQuery({
    queryKey: ['historical-receivables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch historical expenses data
  const { 
    data: expenses, 
    isLoading: isLoadingExpenses 
  } = useQuery({
    queryKey: ['historical-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', threeMonthsAgo);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch historical sales data
  const { 
    data: sales, 
    isLoading: isLoadingSales 
  } = useQuery({
    queryKey: ['historical-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Sales')
        .select('*')
        .gte('date', threeMonthsAgo);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch bank accounts data
  const { 
    data: bankAccounts, 
    isLoading: isLoadingBankAccounts 
  } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*');
        
      if (error) throw error;
      return data;
    }
  });
  
  const historicalData: ForecastHistoricalData = {
    payables: payables || [],
    receivables: receivables || [],
    expenses: expenses || [],
    sales: sales || [],
    bankAccounts: bankAccounts || []
  };
  
  const isLoading = 
    isLoadingPayables || 
    isLoadingReceivables || 
    isLoadingExpenses || 
    isLoadingSales || 
    isLoadingBankAccounts;
  
  return {
    historicalData,
    isLoading
  };
}
