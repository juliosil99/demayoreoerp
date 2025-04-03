
import React, { useEffect } from "react";
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
  
  useEffect(() => {
    if (clientId) {
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
          
          if (data && data.default_chart_account_id) {
            console.log("[SupplierChartAccountHandler] Found default chart account for supplier:", data.default_chart_account_id);
            
            // Only update if the current value is empty or null
            if (!currentChartAccountId || currentChartAccountId === "") {
              console.log("[SupplierChartAccountHandler] Setting chart account to:", data.default_chart_account_id);
              form.setValue("chart_account_id", data.default_chart_account_id, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            } else {
              console.log("[SupplierChartAccountHandler] Not updating chart account as it already has a value:", currentChartAccountId);
            }
          } else {
            console.log("[SupplierChartAccountHandler] No default chart account found for supplier");
          }
        } catch (error) {
          console.error("[SupplierChartAccountHandler] Error in fetchSupplierDefaultChartAccount:", error);
        }
      };
      
      fetchSupplierDefaultChartAccount();
    }
  }, [clientId, form, currentChartAccountId]);

  return null;
}
