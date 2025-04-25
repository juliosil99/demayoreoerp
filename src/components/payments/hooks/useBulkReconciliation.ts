
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SalesTable } from "@/integrations/supabase/types/sales";

export type UnreconciledSale = SalesTable['Row'] & {
  id: number;
  date: string | null;
  Channel: string | null;
  orderNumber: string | null;
  price: number | null;
  productName: string | null;
  type?: string;
};

export function useBulkReconciliation(open: boolean) {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [orderNumbers, setOrderNumbers] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>();

  // Reset filters when the modal is opened/closed
  useEffect(() => {
    if (open) {
      setSelectedChannel("all");
      setOrderNumbers("");
      setSelectedPaymentId(undefined);
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
        .from("Sales")
        .select("*")
        .is("reconciliation_id", null);

      // Apply channel filter if not "all"
      if (selectedChannel !== "all") {
        query = query.eq("Channel", selectedChannel);
      }

      // Apply order numbers filter if provided
      if (orderNumbers) {
        const orderNumbersList = orderNumbers
          .split(",")
          .map((num) => num.trim())
          .filter(Boolean);
        
        if (orderNumbersList.length > 0) {
          query = query.in("orderNumber", orderNumbersList);
        }
      }

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;
      return data as UnreconciledSale[];
    },
    enabled: open,
  });

  return {
    selectedChannel,
    setSelectedChannel,
    orderNumbers,
    setOrderNumbers,
    selectedPaymentId,
    setSelectedPaymentId,
    bankAccounts,
    unreconciled,
    isLoading,
  };
}
