
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export interface BalanceSheetData {
  assets: {
    bankAccounts: number;
    accountsReceivable: number;
    total: number;
  };
  liabilities: {
    accountsPayable: number;
    total: number;
  };
  equity: {
    netIncome: number;
    total: number;
  };
}

export const fetchBalanceSheetData = async (userId: string, fromDate: Date, toDate: Date): Promise<BalanceSheetData | null> => {
  if (!userId || !fromDate || !toDate) return null;

  // Fetch bank account balances (assets)
  const { data: bankAccountsData, error: bankError } = await supabase
    .from("bank_accounts")
    .select("balance");

  if (bankError) throw bankError;

  // Fetch accounts receivable (unpaid sales)
  const { data: receivablesData, error: receivablesError } = await supabase
    .from("Sales")
    .select("price")
    .eq("statusPaid", "pending")
    .lte("date", format(toDate, "yyyy-MM-dd"));

  if (receivablesError) throw receivablesError;

  // Fetch accounts payable
  const { data: payablesData, error: payablesError } = await supabase
    .from("accounts_payable")
    .select("amount")
    .eq("status", "pending")
    .lte("created_at", format(toDate, "yyyy-MM-dd"));

  if (payablesError) throw payablesError;

  // Calculate incomes and expenses
  const { data: salesData, error: salesError } = await supabase
    .from("Sales")
    .select("price")
    .gte("date", format(fromDate, "yyyy-MM-dd"))
    .lte("date", format(toDate, "yyyy-MM-dd"));

  if (salesError) throw salesError;

  const { data: expensesData, error: expensesError } = await supabase
    .from("expenses")
    .select("amount")
    .gte("date", format(fromDate, "yyyy-MM-dd"))
    .lte("date", format(toDate, "yyyy-MM-dd"));

  if (expensesError) throw expensesError;

  // Calculate totals
  const bankTotal = bankAccountsData?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
  const receivablesTotal = receivablesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
  const payablesTotal = payablesData?.reduce((sum, payable) => sum + (payable.amount || 0), 0) || 0;
  const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
  const totalExpenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
  const netIncome = totalSales - totalExpenses;

  const totalAssets = bankTotal + receivablesTotal;
  const totalLiabilities = payablesTotal;
  const totalEquity = netIncome;

  return {
    assets: {
      bankAccounts: bankTotal,
      accountsReceivable: receivablesTotal,
      total: totalAssets,
    },
    liabilities: {
      accountsPayable: payablesTotal,
      total: totalLiabilities,
    },
    equity: {
      netIncome: netIncome,
      total: totalEquity,
    },
  };
};
