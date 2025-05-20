
import { useEffect } from "react";
import { Expense, ExpenseFormData } from "./types";

export function useFormInitializer(
  initialExpense: Expense | undefined,
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>,
  setAccountCurrency: React.Dispatch<React.SetStateAction<string>>
) {
  useEffect(() => {
    if (initialExpense) {
      // Ensure the date is in YYYY-MM-DD format (ISO)
      // This prevents timezone issues when editing expenses
      const rawDate = new Date(initialExpense.date);
      const year = rawDate.getUTCFullYear();
      const month = String(rawDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(rawDate.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Determine if this is a return based on the amount
      const isReturn = initialExpense.amount < 0;
      const originalAmount = Math.abs(initialExpense.original_amount || initialExpense.amount).toString();
      
      setFormData({
        date: formattedDate,
        description: initialExpense.description,
        amount: Math.abs(initialExpense.amount).toString(), // Store absolute value
        original_amount: originalAmount,
        account_id: initialExpense.account_id.toString(),
        chart_account_id: initialExpense.chart_account_id,
        payment_method: initialExpense.payment_method,
        reference_number: initialExpense.reference_number || "",
        notes: initialExpense.notes || "",
        supplier_id: initialExpense.supplier_id || "",
        category: initialExpense.category || "",
        currency: initialExpense.currency || "MXN",
        exchange_rate: initialExpense.exchange_rate?.toString() || "1",
        isReturn: isReturn, // Set based on amount
      });

      // Get the account currency
      if (initialExpense.bank_accounts?.currency) {
        setAccountCurrency(initialExpense.bank_accounts.currency);
      }
    }
  }, [initialExpense, setFormData, setAccountCurrency]);
}
