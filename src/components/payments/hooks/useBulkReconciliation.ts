
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
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
  const [dateRange, setDateRange] = useState<DateRange>();

  // Reset filters when the modal is opened
  const resetFilters = () => {
    setSelectedChannel("all");
    setOrderNumbers("");
    setDateRange(undefined);
    setSelectedPaymentId(undefined);
  };

  // Reset filters when the modal is opened/closed
  useEffect(() => {
    if (open) {
      resetFilters();
    }
  }, [open]);

  // Fetch unreconciled sales
  const { data: unreconciled, isLoading } = useQuery({
    queryKey: ["unreconciled", selectedChannel, orderNumbers, dateRange, selectedPaymentId],
    queryFn: async () => {
      console.log("Fetching unreconciled sales with filters:", {
        channel: selectedChannel,
        orderNumbers,
        dateRange,
        paymentId: selectedPaymentId
      });
      
      let query = supabase
        .from("Sales")
        .select("*")
        .is("reconciliation_id", null);

      // Apply channel filter if not "all"
      if (selectedChannel !== "all") {
        // Get the channel name from the UUID
        const { data: channelData } = await supabase
          .from("sales_channels")
          .select("name")
          .eq("id", selectedChannel)
          .single();
        
        if (channelData?.name) {
          query = query.eq("Channel", channelData.name);
        }
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

      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte("date", dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        query = query.lte("date", dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order("date", { ascending: false });
      if (error) {
        console.error("Error fetching unreconciled sales:", error);
        throw error;
      }
      
      console.log("Fetched unreconciled sales:", data?.length || 0);
      
      // Cast the data to UnreconciledSale[] to ensure type safety
      return data as unknown as UnreconciledSale[];
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
    dateRange,
    setDateRange,
    unreconciled,
    isLoading,
    resetFilters
  };
}
