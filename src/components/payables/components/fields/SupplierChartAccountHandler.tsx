
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
    
    // Fetch supplier's default chart account
    const fetchSupplierDefaultChartAccount = async () => {
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, name, default_chart_account_id")
          .eq("id", clientId)
          .single();
        
        if (error) {
          return;
        }
        
        // Mark this client as processed to prevent infinite loops
        hasSetDefaultRef.current[clientId] = true;
        
        if (data && data.default_chart_account_id && !currentChartAccountId) {
          // Set the chart account
          form.setValue("chart_account_id", data.default_chart_account_id, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
        }
      } catch (error) {
        // Silent error handling
      }
    };
    
    fetchSupplierDefaultChartAccount();
  }, [clientId, form, currentChartAccountId]);

  return null;
}
