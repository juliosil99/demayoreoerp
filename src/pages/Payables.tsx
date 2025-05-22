import React, { useState } from "react";
import { PayablesList } from "@/components/payables/components/PayablesList";
import { PayablesFilter } from "@/components/payables/components/PayablesFilter";
import { PayableFormDialog } from "@/components/payables/components/PayableFormDialog";
import { PayableEditDialog } from "@/components/payables/components/PayableEditDialog";
import { PayableStatusFilter } from "@/components/payables/hooks/useFetchPayables";
import { AccountPayable } from "@/types/payables";
import { PayableFormData } from "@/components/payables/types/payableTypes";
import { usePaginatedPayables } from "@/components/payables/hooks/usePaginatedPayables";
import { PayablesPagination } from "@/components/payables/components/PayablesPagination";
import { useCreatePayable } from "@/components/payables/hooks/useCreatePayable";
import { useUpdatePayable } from "@/components/payables/hooks/useUpdatePayable";
import { useMarkPayableAsPaid } from "@/components/payables/hooks/useMarkPayableAsPaid";
import { useDeletePayable } from "@/components/payables/hooks/useDeletePayable";

const Payables = () => {
  const [statusFilter, setStatusFilter] = useState<PayableStatusFilter>("pending");
  const { 
    payables, 
    isLoading, 
    currentPage, 
    totalPages, 
    setPage 
  } = usePaginatedPayables(statusFilter);
  
  const createPayable = useCreatePayable();
  const updatePayable = useUpdatePayable();
  const markAsPaid = useMarkPayableAsPaid();
  const deletePayable = useDeletePayable();
  const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);

  const handleCreatePayable = async (data: PayableFormData): Promise<boolean> => {
    try {
      await createPayable.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUpdatePayable = async (
    id: string, 
    data: PayableFormData, 
    updateSeries: boolean = false
  ): Promise<boolean> => {
    try {
      await updatePayable.mutateAsync({ id, data, updateSeries });
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleEditPayable = (payable: AccountPayable) => {
    setEditingPayable(payable);
  };

  const handleCloseEditDialog = () => {
    setEditingPayable(null);
  };

  const handleMarkAsPaid = (payableId: string) => {
    markAsPaid.mutate(payableId);
  };

  const handleDeletePayable = (payableId: string) => {
    deletePayable.mutate(payableId);
  };

  const handleFilterChange = (value: PayableStatusFilter) => {
    setStatusFilter(value);
    // Reset to first page when filter changes
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuentas por Pagar</h1>
        <PayableFormDialog 
          onSubmit={handleCreatePayable}
          isSubmitting={createPayable.isPending}
        />
      </div>

      <div className="flex justify-between items-center">
        <PayablesFilter 
          currentFilter={statusFilter} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      <PayablesList 
        payables={payables} 
        isLoading={isLoading}
        onMarkAsPaid={handleMarkAsPaid}
        onEdit={handleEditPayable}
        onDelete={handleDeletePayable}
        isPending={markAsPaid.isPending || updatePayable.isPending}
        isDeleting={deletePayable.isPending}
        statusFilter={statusFilter}
      />

      <PayablesPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <PayableEditDialog
        payable={editingPayable}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdatePayable}
        isSubmitting={updatePayable.isPending}
      />
    </div>
  );
}

export default Payables;
