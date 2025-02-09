
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function useBulkReconciliation(open: boolean) {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [paymentDetails, setPaymentDetails] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    account_id: "",
    payment_method: "transfer",
    reference_number: "",
  });

  const { data: bankAccounts } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: unreconciled, isLoading } = useQuery({
    queryKey: ["unreconciled-sales", selectedChannel, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select("*")
        .is("reconciliation_id", null)
        .eq("statusPaid", "por cobrar");

      if (selectedChannel !== "all") {
        query = query.eq("Channel", selectedChannel);
      }

      if (dateRange.from && dateRange.to) {
        query = query
          .gte("date", dateRange.from)
          .lte("date", dateRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  return {
    selectedChannel,
    setSelectedChannel,
    dateRange,
    setDateRange,
    paymentDetails,
    setPaymentDetails,
    bankAccounts,
    unreconciled,
    isLoading
  };
}
