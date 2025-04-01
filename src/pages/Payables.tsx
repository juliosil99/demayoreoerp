
import React from "react";
import { PayablesList } from "@/components/payables/components/PayablesList";
import { PayableFormDialog } from "@/components/payables/components/PayableFormDialog";
import { usePayables } from "@/components/payables/hooks/usePayables";
import { PayableFormData } from "@/components/payables/types/payableTypes";

const Payables = () => {
  const { payables, isLoading, createPayable, markAsPaid } = usePayables();

  const handleCreatePayable = async (data: PayableFormData): Promise<boolean> => {
    try {
      await createPayable.mutateAsync(data);
      return true;
    } catch (error) {
      console.error("Error creating payable:", error);
      return false;
    }
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
        isPending={markAsPaid.isPending}
      />
    </div>
  );
};

export default Payables;
