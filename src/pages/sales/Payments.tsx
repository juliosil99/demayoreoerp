
import { useState } from "react";
import { Payment } from "@/components/payments/PaymentForm";
import { BulkReconciliationDialog } from "@/components/payments/BulkReconciliationDialog";
import { usePaymentsQuery } from "./hooks/usePaymentsQuery";
import { usePaymentDelete } from "./hooks/usePaymentDelete";
import { usePaymentStatusUpdate } from "./hooks/usePaymentStatusUpdate";
import { PaymentTable } from "./components/PaymentTable";
import { PaymentHeader } from "./components/PaymentHeader";
import { PaymentFormDialog } from "./components/PaymentFormDialog";
import { PaymentPagination } from "./components/PaymentPagination";
import { PaymentFilters } from "./components/PaymentFilters";
import { DateRange } from "react-day-picker";
import { useBulkReconcile } from "./hooks/useBulkReconcile";
import { usePaymentQueries } from "@/components/payments/hooks/usePaymentQueries";

type PaymentWithRelations = Payment & {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
};

export default function Payments() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showBulkReconciliation, setShowBulkReconciliation] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [salesChannelId, setSalesChannelId] = useState<string | undefined>(undefined);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const { bankAccounts, salesChannels } = usePaymentQueries();

  const { data: payments, isLoading, totalCount } = usePaymentsQuery({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    dateRange: isFilterApplied ? dateRange : undefined,
    salesChannelId: isFilterApplied ? salesChannelId : undefined,
    accountId: isFilterApplied ? accountId : undefined,
    status: isFilterApplied ? status : undefined
  });
  
  const deletePaymentMutation = usePaymentDelete();
  const statusUpdateMutation = usePaymentStatusUpdate();
  const bulkReconcileMutation = useBulkReconcile();

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pago?")) {
      deletePaymentMutation.mutate(id);
    }
  };

  const handleStatusUpdate = (id: string, status: 'confirmed' | 'pending') => {
    statusUpdateMutation.mutate({ paymentId: id, status });
  };

  const handleEdit = (payment: PaymentWithRelations) => {
    const paymentData: Payment = {
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number,
      sales_channel_id: payment.sales_channel_id,
      account_id: Number(payment.account_id),
      notes: payment.notes,
      status: payment.status || 'confirmed',
    };
    setPaymentToEdit(paymentData);
    setIsAddingPayment(true);
  };

  const handleSuccess = () => {
    setIsAddingPayment(false);
    setPaymentToEdit(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters are applied
    setIsFilterApplied(true);
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setSalesChannelId(undefined);
    setAccountId(undefined);
    setStatus(undefined);
    setCurrentPage(1);
    setIsFilterApplied(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PaymentHeader 
        onOpenAddPayment={() => setIsAddingPayment(true)} 
        onOpenBulkReconciliation={() => setShowBulkReconciliation(true)} 
      />

      <PaymentFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        salesChannelId={salesChannelId}
        setSalesChannelId={setSalesChannelId}
        accountId={accountId}
        setAccountId={setAccountId}
        status={status}
        setStatus={setStatus}
        bankAccounts={bankAccounts || []}
        salesChannels={salesChannels || []}
        onResetFilters={handleResetFilters}
        onApplyFilters={handleApplyFilters}
      />

      <PaymentFormDialog
        open={isAddingPayment}
        onOpenChange={setIsAddingPayment}
        paymentToEdit={paymentToEdit}
        onSuccess={handleSuccess}
      />

      <BulkReconciliationDialog 
        open={showBulkReconciliation}
        onOpenChange={setShowBulkReconciliation}
        onReconcile={bulkReconcileMutation.mutate}
      />

      <PaymentTable
        payments={payments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
      />
      
      <PaymentPagination
        totalItems={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
