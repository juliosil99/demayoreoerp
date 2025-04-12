
import { useAccountDetails } from './hooks/useAccountDetails';
import { usePayments } from './hooks/usePayments';
import { usePaymentDialogs } from './hooks/usePaymentDialogs';
import { usePaymentGeneration } from './hooks/usePaymentGeneration';

export function usePaymentSchedule() {
  // Get account details
  const { 
    accountId, 
    account, 
    isLoadingAccount, 
    accountError, 
    navigate 
  } = useAccountDetails();

  // Get payments data and operations
  const { 
    payments, 
    isLoadingPayments, 
    paymentsError, 
    addPayment, 
    deletePayment 
  } = usePayments();

  // Get dialog state management
  const { 
    showAddDialog, 
    setShowAddDialog, 
    showGenerateDialog, 
    setShowGenerateDialog,
    newPayment, 
    setNewPayment, 
    generateMonths, 
    setGenerateMonths 
  } = usePaymentDialogs();

  // Get payment generation functionality
  const { generatePayments } = usePaymentGeneration();

  // Handle action functions
  const handleAddPayment = () => {
    addPayment.mutate(newPayment);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment.mutate(paymentId);
  };

  const handleGeneratePayments = () => {
    if (!account) return;
    generatePayments.mutate({ months: generateMonths, account });
  };

  return {
    accountId,
    account,
    payments,
    isLoadingAccount,
    isLoadingPayments,
    accountError,
    paymentsError,
    navigate,
    showAddDialog,
    setShowAddDialog,
    showGenerateDialog,
    setShowGenerateDialog,
    newPayment,
    setNewPayment,
    generateMonths,
    setGenerateMonths,
    handleAddPayment,
    handleDeletePayment,
    handleGeneratePayments
  };
}
