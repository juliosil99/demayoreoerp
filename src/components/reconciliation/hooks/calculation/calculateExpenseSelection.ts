
/**
 * Util para calcular totales y restante de conciliación SOLO en la moneda original,
 * usando la misma lógica que hooks y UI (sin conversiones).
 * Permite únicamente conciliación cuando todas las monedas coinciden.
 */
export function calculateExpenseSelection(expense: any, invoices: any[]) {
  if (!expense || !invoices.length) {
    return { totalSelectedAmount: 0, remainingAmount: 0, error: false, currency: expense?.currency || "MXN" };
  }
  const expenseCurrency = expense.currency || "MXN";
  const expenseAmount = expenseCurrency === 'USD' ? expense.original_amount : expense.amount;

  for (const invoice of invoices) {
    const invoiceCurrency = invoice.currency || "MXN";
    if (invoiceCurrency !== expenseCurrency) {
      return { totalSelectedAmount: 0, remainingAmount: 0, error: true, errorCurrency: invoiceCurrency, currency: expenseCurrency };
    }
  }

  const totalSelectedAmount = invoices.reduce((sum, inv) => {
    const amount = inv.invoice_type === "E" ? -inv.total_amount : inv.total_amount;
    return sum + amount;
  }, 0);

  const remainingAmount = expenseAmount - totalSelectedAmount;

  return { totalSelectedAmount, remainingAmount, error: false, currency: expenseCurrency };
}
