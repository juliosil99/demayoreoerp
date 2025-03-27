
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function useBulkReconciliation(open: boolean) {
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [orderNumbers, setOrderNumbers] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    account_id: "",
    payment_method: "transfer",
    reference_number: "",
    sales_channel_id: "",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedChannel("");
      setOrderNumbers("");
      setPaymentDetails({
        date: format(new Date(), 'yyyy-MM-dd'),
        account_id: "",
        payment_method: "transfer",
        reference_number: "",
        sales_channel_id: "",
      });
    }
  }, [open]);

  // Update sales_channel_id when selectedChannel changes
  useEffect(() => {
    if (selectedChannel) {
      setPaymentDetails(prev => ({
        ...prev,
        sales_channel_id: selectedChannel
      }));
    }
  }, [selectedChannel]);

  // Fetch bank accounts
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

  // Fetch sales channels
  const { data: salesChannels } = useQuery({
    queryKey: ["salesChannels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_channels")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch unreconciled sales
  const { data: unreconciled, isLoading } = useQuery({
    queryKey: ["unreconciled-sales", selectedChannel, orderNumbers],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select("*")
        .is("reconciliation_id", null);

      if (selectedChannel) {
        query = query.eq("Channel", selectedChannel);
      }

      if (orderNumbers.trim()) {
        const orderNumbersArray = orderNumbers
          .split(",")
          .map(n => n.trim())
          .filter(Boolean);

        if (orderNumbersArray.length > 0) {
          query = query.in("orderNumber", orderNumbersArray);
        }
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
    orderNumbers,
    setOrderNumbers,
    paymentDetails,
    setPaymentDetails,
    bankAccounts,
    salesChannels,
    unreconciled,
    isLoading
  };
}
