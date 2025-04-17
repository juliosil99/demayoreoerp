
import { useState } from "react";
import { format } from "date-fns";

export function usePaymentDialogs() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    due_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0
  });
  const [generateMonths, setGenerateMonths] = useState(6);

  return {
    showAddDialog,
    setShowAddDialog,
    showGenerateDialog,
    setShowGenerateDialog,
    newPayment,
    setNewPayment,
    generateMonths,
    setGenerateMonths
  };
}
