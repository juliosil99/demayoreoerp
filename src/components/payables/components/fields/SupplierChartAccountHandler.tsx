
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
  
  useEffect(() => {
    if (clientId) {
      // Fetch supplier's default chart account
      const fetchSupplierDefaultChartAccount = async () => {
        try {
          const { data, error } = await supabase
            .from("contacts")
            .select("default_chart_account_id")
            .eq("id", clientId)
            .single();
          
          if (error) {
            console.error("Error fetching supplier default chart account:", error);
            return;
          }
          
          if (data && data.default_chart_account_id) {
            console.log("Found default chart account for supplier:", data.default_chart_account_id);
            form.setValue("chart_account_id", data.default_chart_account_id);
          }
        } catch (error) {
          console.error("Error in fetchSupplierDefaultChartAccount:", error);
        }
      };
      
      fetchSupplierDefaultChartAccount();
    }
  }, [clientId, form]);

  return null;
}
