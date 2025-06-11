
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExpenseData, PaymentData, TransferData } from "./transaction-types";

/**
 * Fetches expenses for a specific account
 */
export async function fetchExpenses(accountId: number, userId: string): Promise<ExpenseData[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, date, description, amount, reference_number, currency, exchange_rate, original_amount, chart_accounts:chart_account_id(name)')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error al cargar los gastos');
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches payments for a specific account
 */
export async function fetchPayments(accountId: number, userId: string): Promise<PaymentData[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, date, amount, reference_number, notes, clients:client_id(name)')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error al cargar los pagos');
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches outgoing transfers from this account
 */
export async function fetchTransfersFrom(accountId: number, userId: string): Promise<TransferData[]> {
  try {
    const { data, error } = await supabase
      .from('account_transfers')
      .select(`
        id, 
        date, 
        amount_from, 
        amount_to,
        exchange_rate,
        reference_number, 
        notes, 
        to_account_id,
        bank_accounts!account_transfers_to_account_id_fkey(name, currency)
      `)
      .eq('from_account_id', accountId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error al cargar las transferencias salientes');
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches incoming transfers to this account
 */
export async function fetchTransfersTo(accountId: number, userId: string): Promise<TransferData[]> {
  try {
    const { data, error } = await supabase
      .from('account_transfers')
      .select(`
        id, 
        date, 
        amount_from,
        amount_to,
        exchange_rate,
        reference_number, 
        notes, 
        from_account_id,
        from_account:bank_accounts!account_transfers_from_account_id_fkey(name, currency)
      `)
      .eq('to_account_id', accountId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error al cargar las transferencias entrantes');
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches the currency of a specific account
 */
export async function fetchAccountCurrency(accountId: number): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('currency')
      .eq('id', accountId)
      .single();

    if (error) {
      throw error;
    }

    return data?.currency || 'MXN';
  } catch (error) {
    throw error;
  }
}
