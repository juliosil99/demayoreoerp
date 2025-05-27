
import { 
  AccountTransaction, 
  ExpenseData, 
  PaymentData, 
  TransferData 
} from "./transaction-types";

/**
 * Transforms expense data into the unified transaction format
 */
export function transformExpensesToTransactions(
  expenses: ExpenseData[], 
  accountCurrency: string = 'MXN'
): AccountTransaction[] {
  return expenses.map(expense => {
    const expenseCurrency = expense.currency || 'MXN';
    const isSameCurrency = expenseCurrency === accountCurrency;
    
    // Use original_amount when expense currency matches account currency
    // Use amount (converted) when currencies are different
    const displayAmount = isSameCurrency && expense.original_amount 
      ? expense.original_amount 
      : expense.amount;
    
    return {
      id: expense.id,
      date: expense.date,
      description: expense.description,
      amount: displayAmount,
      type: 'out' as const,
      reference: expense.reference_number || '-',
      source: 'expense' as const,
      source_id: expense.id,
      // Include exchange info for cross-currency expenses
      exchange_rate: !isSameCurrency && expense.exchange_rate ? expense.exchange_rate : undefined,
      original_amount: !isSameCurrency && expense.original_amount ? expense.original_amount : undefined,
      original_currency: !isSameCurrency ? expenseCurrency : undefined
    };
  });
}

/**
 * Transforms payment data into the unified transaction format
 */
export function transformPaymentsToTransactions(payments: PaymentData[]): AccountTransaction[] {
  return payments.map(payment => ({
    id: payment.id,
    date: payment.date,
    description: payment.notes || `Pago de ${payment.clients?.name || 'Cliente'}`,
    amount: payment.amount,
    type: 'in' as const,
    reference: payment.reference_number || '-',
    source: 'payment' as const,
    source_id: payment.id
  }));
}

/**
 * Transforms outgoing transfer data into the unified transaction format
 */
export function transformTransfersFromToTransactions(
  transfers: TransferData[], 
  accountCurrency: string
): AccountTransaction[] {
  return transfers.map(transfer => {
    const toAccountName = transfer.bank_accounts?.name || 'otra cuenta';
    const toCurrency = transfer.bank_accounts?.currency || 'MXN';
    const isCrossCurrency = toCurrency !== accountCurrency;
    
    // Para transferencias salientes, siempre usar amount_from (que está en la moneda de la cuenta origen)
    return {
      id: transfer.id,
      date: transfer.date,
      description: isCrossCurrency 
        ? `Transferencia a ${toAccountName} (${toCurrency})`
        : `Transferencia a ${toAccountName}`,
      amount: transfer.amount_from, // Siempre usar amount_from para salientes
      type: 'out' as const,
      reference: transfer.reference_number || '-',
      source: 'transfer' as const,
      source_id: transfer.id,
      exchange_rate: isCrossCurrency ? transfer.exchange_rate || undefined : undefined,
      original_amount: isCrossCurrency ? transfer.amount_to : undefined,
      original_currency: isCrossCurrency ? toCurrency : undefined
    };
  });
}

/**
 * Transforms incoming transfer data into the unified transaction format
 */
export function transformTransfersToToTransactions(
  transfers: TransferData[], 
  accountCurrency: string
): AccountTransaction[] {
  return transfers.map(transfer => {
    // Usar from_account en lugar de bank_accounts para transferencias entrantes
    const fromAccountName = (transfer as any).from_account?.name || transfer.bank_accounts?.name || 'otra cuenta';
    const fromCurrency = (transfer as any).from_account?.currency || transfer.bank_accounts?.currency || 'MXN';
    const isCrossCurrency = fromCurrency !== accountCurrency;
    
    // Para transferencias entrantes, SIEMPRE usar amount_to (moneda de destino)
    // y asegurar que el tipo sea 'in'
    return {
      id: transfer.id,
      date: transfer.date,
      description: isCrossCurrency 
        ? `Transferencia de ${fromAccountName} (${fromCurrency})`
        : `Transferencia de ${fromAccountName}`,
      amount: transfer.amount_to, // SIEMPRE usar amount_to para entrantes
      type: 'in' as const, // SIEMPRE 'in' para transferencias entrantes
      reference: transfer.reference_number || '-',
      source: 'transfer' as const,
      source_id: transfer.id,
      exchange_rate: isCrossCurrency ? transfer.exchange_rate || undefined : undefined,
      original_amount: isCrossCurrency ? transfer.amount_from : undefined,
      original_currency: isCrossCurrency ? fromCurrency : undefined
    };
  });
}

/**
 * Sorts transactions by date, newest first
 */
export function sortTransactionsByDate(transactions: AccountTransaction[]): AccountTransaction[] {
  return [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
