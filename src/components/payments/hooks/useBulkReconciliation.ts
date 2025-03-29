
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBulkReconciliation(open: boolean) {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [orderNumbers, setOrderNumbers] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    account_id: "",
    payment_method: "transfer",
    reference_number: "",
  });

  // Reset filters when the modal is opened/closed
  useEffect(() => {
    if (open) {
      setSelectedChannel("all");
      setOrderNumbers("");
    }
  }, [open]);

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

  // Fetch unreconciled sales
  const { data: unreconciled, isLoading } = useQuery({
    queryKey: ["unreconciled", selectedChannel, orderNumbers],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select("*")
        .is("payment_id", null);

      // Apply channel filter if not "all"
      if (selectedChannel !== "all") {
        query = query.eq("sales_channel_id", selectedChannel);
      }

      // Apply order numbers filter if provided
      if (orderNumbers) {
        const orderNumbersList = orderNumbers
          .split(",")
          .map((num) => num.trim())
          .filter(Boolean);
        
        if (orderNumbersList.length > 0) {
          query = query.in("order_number", orderNumbersList);
        }
      }

      const { data, error } = await query.order("date", { ascending: false });
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
    unreconciled,
    isLoading,
  };
}
