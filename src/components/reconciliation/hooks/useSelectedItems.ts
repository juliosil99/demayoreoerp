
import { useState } from "react";

export const useSelectedItems = () => {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);

  const resetState = () => {
    setSelectedExpense(null);
    setSelectedInvoices([]);
    setRemainingAmount(0);
  };

  return {
    selectedExpense,
    setSelectedExpense,
    selectedInvoices,
    setSelectedInvoices,
    remainingAmount,
    setRemainingAmount,
    resetState,
  };
};
