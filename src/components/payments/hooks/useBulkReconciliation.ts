
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function useBulkReconciliation(open: boolean) {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [orderNumbers, setOrderNumbers] = useState<string>("");
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
    queryKey: ["unreconciled-sales", selectedChannel, orderNumbers],
    queryFn: async () => {
      const orderNumbersList = orderNumbers
        .split('\n')
        .map(order => order.trim())
        .filter(order => order.length > 0);

      if (orderNumbersList.length === 0) return [];

      let query = supabase
        .from("Sales")
        .select("*")
        .is("reconciliation_id", null)
        .eq("statusPaid", "por cobrar")
        .in("orderNumber", orderNumbersList);

      if (selectedChannel !== "all") {
        query = query.eq("Channel", selectedChannel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open && orderNumbers.trim().length > 0,
  });

  return {
    selectedChannel,
    setSelectedChannel,
    orderNumbers,
    setOrderNumbers,
    paymentDetails,
    setPaymentDetails,
    bankAccounts,
    unreconciled,
    isLoading
  };
}
