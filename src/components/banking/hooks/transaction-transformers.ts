
import { 
  AccountTransaction, 
  ExpenseData, 
  PaymentData, 
  TransferData 
} from "./transaction-types";

/**
 * Transforms expense data into the unified transaction format
 */
export function transformExpensesToTransactions(expenses: ExpenseData[]): AccountTransaction[] {
  return expenses.map(expense => ({
    id: expense.id,
    date: expense.date,
    description: expense.description,
    amount: expense.amount,
    type: 'out' as const,
    reference: expense.reference_number || '-',
    source: 'expense' as const,
    source_id: expense.id
  }));
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
    const fromAccountName = transfer.bank_accounts?.name || 'otra cuenta';
    const fromCurrency = transfer.bank_accounts?.currency || 'MXN';
    const isCrossCurrency = fromCurrency !== accountCurrency;
    
    // Para transferencias entrantes, siempre usar amount_to (que está en la moneda de la cuenta destino)
    return {
      id: transfer.id,
      date: transfer.date,
      description: isCrossCurrency 
        ? `Transferencia de ${fromAccountName} (${fromCurrency})`
        : `Transferencia de ${fromAccountName}`,
      amount: transfer.amount_to, // Siempre usar amount_to para entrantes
      type: 'in' as const,
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
