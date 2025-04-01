
import React, { useState } from "react";
import { PayablesList } from "@/components/payables/components/PayablesList";
import { PayableFormDialog } from "@/components/payables/components/PayableFormDialog";
import { PayableEditDialog } from "@/components/payables/components/PayableEditDialog";
import { usePayables } from "@/components/payables/hooks/usePayables";
import { PayableFormData } from "@/components/payables/types/payableTypes";
import { AccountPayable } from "@/types/payables";

const Payables = () => {
  const { payables, isLoading, createPayable, updatePayable, markAsPaid } = usePayables();
  const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);

  const handleCreatePayable = async (data: PayableFormData): Promise<boolean> => {
    try {
      await createPayable.mutateAsync(data);
      return true;
    } catch (error) {
      console.error("Error creating payable:", error);
      return false;
    }
  };

  const handleUpdatePayable = async (id: string, data: PayableFormData): Promise<boolean> => {
    try {
      await updatePayable.mutateAsync({ id, data });
      return true;
    } catch (error) {
      console.error("Error updating payable:", error);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuentas por Pagar</h1>
        <PayableFormDialog 
          onSubmit={handleCreatePayable}
          isSubmitting={createPayable.isPending}
        />
      </div>

      <PayablesList 
        payables={payables} 
        isLoading={isLoading}
        onMarkAsPaid={handleMarkAsPaid}
        onEdit={handleEditPayable}
        isPending={markAsPaid.isPending || updatePayable.isPending}
      />

      <PayableEditDialog
        payable={editingPayable}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdatePayable}
        isSubmitting={updatePayable.isPending}
      />
    </div>
  );
};

export default Payables;
