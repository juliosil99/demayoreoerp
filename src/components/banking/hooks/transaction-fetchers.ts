
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExpenseData, PaymentData, TransferData } from "./transaction-types";

/**
 * Fetches expenses for a specific account
 */
export async function fetchExpenses(accountId: number, userId: string): Promise<ExpenseData[]> {
  console.log('🔍 fetchExpenses - Starting fetch');
  console.log('🔍 fetchExpenses - accountId:', accountId, 'userId:', userId);
  
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, date, description, amount, reference_number, currency, exchange_rate, original_amount, chart_accounts:chart_account_id(name)')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ fetchExpenses - Supabase error:', error);
      toast.error('Error al cargar los gastos');
      throw error;
    }

    console.log('✅ fetchExpenses - Success, data count:', data?.length || 0);
    console.log('✅ fetchExpenses - First few records:', data?.slice(0, 3));
    return data || [];
  } catch (error) {
    console.error('❌ fetchExpenses - Unexpected error:', error);
    throw error;
  }
}

/**
 * Fetches payments for a specific account
 */
export async function fetchPayments(accountId: number, userId: string): Promise<PaymentData[]> {
  console.log('🔍 fetchPayments - Starting fetch');
  console.log('🔍 fetchPayments - accountId:', accountId, 'userId:', userId);
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, date, amount, reference_number, notes, clients:client_id(name)')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ fetchPayments - Supabase error:', error);
      toast.error('Error al cargar los pagos');
      throw error;
    }

    console.log('✅ fetchPayments - Success, data count:', data?.length || 0);
    console.log('✅ fetchPayments - First few records:', data?.slice(0, 3));
    return data || [];
  } catch (error) {
    console.error('❌ fetchPayments - Unexpected error:', error);
    throw error;
  }
}

/**
 * Fetches outgoing transfers from this account
 */
export async function fetchTransfersFrom(accountId: number, userId: string): Promise<TransferData[]> {
  console.log('🔍 fetchTransfersFrom - Starting fetch');
  console.log('🔍 fetchTransfersFrom - accountId:', accountId, 'userId:', userId);
  
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
      console.error('❌ fetchTransfersFrom - Supabase error:', error);
      toast.error('Error al cargar las transferencias salientes');
      throw error;
    }

    console.log('✅ fetchTransfersFrom - Success, data count:', data?.length || 0);
    console.log('✅ fetchTransfersFrom - First few records:', data?.slice(0, 3));
    return data || [];
  } catch (error) {
    console.error('❌ fetchTransfersFrom - Unexpected error:', error);
    throw error;
  }
}

/**
 * Fetches incoming transfers to this account
 */
export async function fetchTransfersTo(accountId: number, userId: string): Promise<TransferData[]> {
  console.log('🔍 fetchTransfersTo - Starting fetch');
  console.log('🔍 fetchTransfersTo - accountId:', accountId, 'userId:', userId);
  
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
      console.error('❌ fetchTransfersTo - Supabase error:', error);
      toast.error('Error al cargar las transferencias entrantes');
      throw error;
    }

    console.log('✅ fetchTransfersTo - Success, data count:', data?.length || 0);
    console.log('✅ fetchTransfersTo - First few records:', data?.slice(0, 3));
    return data || [];
  } catch (error) {
    console.error('❌ fetchTransfersTo - Unexpected error:', error);
    throw error;
  }
}

/**
 * Fetches the currency of a specific account
 */
export async function fetchAccountCurrency(accountId: number): Promise<string> {
  console.log('🔍 fetchAccountCurrency - Starting fetch');
  console.log('🔍 fetchAccountCurrency - accountId:', accountId);
  
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('currency')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('❌ fetchAccountCurrency - Supabase error:', error);
      throw error;
    }

    console.log('✅ fetchAccountCurrency - Success, currency:', data?.currency || 'MXN');
    return data?.currency || 'MXN';
  } catch (error) {
    console.error('❌ fetchAccountCurrency - Unexpected error:', error);
    throw error;
  }
}
