
/**
 * Core transaction types used across the banking module
 */

export type TransactionSource = 'expense' | 'payment' | 'transfer';
export type TransactionType = 'in' | 'out';

export interface AccountTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  reference: string;
  source: TransactionSource;
  source_id: string;
  // Currency exchange fields
  exchange_rate?: number;
  original_amount?: number;
  original_currency?: string;
}

// Type for raw expense data from database
export interface ExpenseData {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference_number: string | null;
  currency?: string;
  exchange_rate?: number;
  original_amount?: number;
  chart_accounts?: {
    name: string;
  } | null;
}

// Type for raw payment data from database
export interface PaymentData {
  id: string;
  date: string;
  amount: number;
  reference_number: string | null;
  notes: string | null;
  clients?: {
    name: string;
  } | null;
}

// Type for raw transfer data from database - Updated to include from_account
export interface TransferData {
  id: string;
  date: string;
  amount_from: number;
  amount_to: number;
  exchange_rate: number | null;
  reference_number: string | null;
  notes: string | null;
  to_account_id?: number;
  from_account_id?: number;
  bank_accounts?: {
    name: string;
    currency: string;
  } | null;
  // Additional field for incoming transfers
  from_account?: {
    name: string;
    currency: string;
  } | null;
}
