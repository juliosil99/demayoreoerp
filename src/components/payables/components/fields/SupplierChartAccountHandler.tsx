
import React, { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { PayableFormData } from "../../types/payableTypes";
import { supabase } from "@/integrations/supabase/client";

interface SupplierChartAccountHandlerProps {
  form: UseFormReturn<PayableFormData>;
}

export function SupplierChartAccountHandler({ form }: SupplierChartAccountHandlerProps) {
  // When client changes, watch for supplier's default chart account
  const clientId = form.watch("client_id");
  const currentChartAccountId = form.watch("chart_account_id");
  const hasSetDefaultRef = useRef<{[key: string]: boolean}>({});
  
  useEffect(() => {
    if (!clientId || hasSetDefaultRef.current[clientId]) {
      return; // Skip if no client ID or we've already processed this client
    }
    
    console.log("[SupplierChartAccountHandler] Client ID changed to:", clientId);
    
    // Fetch supplier's default chart account
    const fetchSupplierDefaultChartAccount = async () => {
      try {
        console.log("[SupplierChartAccountHandler] Fetching chart account for supplier:", clientId);
        
        const { data, error } = await supabase
          .from("contacts")
          .select("id, name, default_chart_account_id")
          .eq("id", clientId)
          .single();
        
        if (error) {
          console.error("[SupplierChartAccountHandler] Error fetching supplier default chart account:", error);
          return;
        }
        
        console.log("[SupplierChartAccountHandler] Supplier data:", data);
        
        if (data && data.default_chart_account_id && !currentChartAccountId) {
          console.log("[SupplierChartAccountHandler] Found default chart account for supplier:", data.default_chart_account_id);
          
          // Mark this client as processed
          hasSetDefaultRef.current[clientId] = true;
          
          // Set the chart account
          form.setValue("chart_account_id", data.default_chart_account_id, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
          
          console.log("[SupplierChartAccountHandler] Set chart account to:", data.default_chart_account_id);
        } else {
          console.log("[SupplierChartAccountHandler] No default chart account found or chart account already set");
          // Still mark this client as processed to avoid repeated calls
          hasSetDefaultRef.current[clientId] = true;
        }
      } catch (error) {
        console.error("[SupplierChartAccountHandler] Error in fetchSupplierDefaultChartAccount:", error);
      }
    };
    
    fetchSupplierDefaultChartAccount();
  }, [clientId, form, currentChartAccountId]);

  return null;
}
