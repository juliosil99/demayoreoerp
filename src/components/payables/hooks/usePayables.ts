
import { useCreatePayable } from "./useCreatePayable";
import { useUpdatePayable } from "./useUpdatePayable";
import { useMarkPayableAsPaid } from "./useMarkPayableAsPaid";
import { useDeletePayable } from "./useDeletePayable";
import { useFetchPayables, PayableStatusFilter } from "./useFetchPayables";
import { UpdatePayableParams } from "./useUpdatePayable";

export function usePayables(statusFilter: PayableStatusFilter = "pending") {
  const { data: payables, isLoading } = useFetchPayables(statusFilter);
  const createPayable = useCreatePayable();
  const updatePayable = useUpdatePayable();
  const markAsPaid = useMarkPayableAsPaid();
  const deletePayable = useDeletePayable();

  return {
    payables,
    isLoading,
    createPayable,
    updatePayable,
    markAsPaid,
    deletePayable
  };
}

// Re-export the UpdatePayableParams type for consumers that need it
export type { UpdatePayableParams, PayableStatusFilter };
