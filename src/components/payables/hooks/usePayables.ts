
import { useCreatePayable } from "./useCreatePayable";
import { useUpdatePayable } from "./useUpdatePayable";
import { useMarkPayableAsPaid } from "./useMarkPayableAsPaid";
import { useFetchPayables } from "./useFetchPayables";
import { UpdatePayableParams } from "./useUpdatePayable";

export function usePayables() {
  const { data: payables, isLoading } = useFetchPayables();
  const createPayable = useCreatePayable();
  const updatePayable = useUpdatePayable();
  const markAsPaid = useMarkPayableAsPaid();

  return {
    payables,
    isLoading,
    createPayable,
    updatePayable,
    markAsPaid
  };
}

// Re-export the UpdatePayableParams type for consumers that need it
export type { UpdatePayableParams };
