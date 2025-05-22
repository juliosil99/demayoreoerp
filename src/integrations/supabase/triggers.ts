
import { supabase } from "./client";

/**
 * Checks for the existence of necessary triggers for the reconciliation process
 * Uses the check-triggers edge function or falls back to RPC if the function fails
 */
export async function checkReconciliationTriggers() {
  try {
    // First attempt: Call the edge function
    console.log("Attempting to check triggers via edge function...");
    try {
      const { data, error } = await supabase.functions.invoke("check-triggers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: {} // Send an empty object as the body
      });
      
      if (error) {
        console.warn("Edge function error:", error);
        throw error;
      }
      
      if (!data) {
        console.warn("No data returned from edge function");
        throw new Error("Invalid response from edge function");
      }
      
      // Handle the case where the function returned success:false
      if (data && !data.success) {
        console.warn("Edge function reported failure:", data.message || data.error);
        throw new Error(data.message || "Edge function reported failure");
      }
      
      return { 
        success: true, 
        data: data.data,
        hasPaymentTrigger: data.hasPaymentTrigger || false,
        hasSalesTrigger: data.hasSalesTrigger || false
      };
    } catch (edgeFunctionError) {
      // Second attempt: Fall back to direct RPC call
      console.log("Edge function failed, falling back to RPC call...", edgeFunctionError);
      
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('list_triggers_for_reconciliation');
        
        if (rpcError) {
          console.error("Both edge function and RPC fallback failed:", rpcError);
          return { 
            success: false, 
            error: `Trigger verification failed: ${rpcError.message || String(edgeFunctionError)}`,
            usedFallback: true 
          };
        }
        
        // Process the data similar to how the edge function would
        const hasPaymentTrigger = rpcData?.some((t: any) => 
          t.trigger_name?.toLowerCase().includes('payment') && 
          t.event_manipulation === 'UPDATE'
        ) || false;
        
        const hasSalesTrigger = rpcData?.some((t: any) => 
          t.trigger_name?.toLowerCase().includes('sale') && 
          t.event_manipulation === 'UPDATE'
        ) || false;
        
        console.log("RPC fallback succeeded, using direct database response");
        
        return { 
          success: true, 
          data: rpcData,
          hasPaymentTrigger,
          hasSalesTrigger,
          usedFallback: true
        };
      } catch (rpcFallbackError) {
        // If both attempts fail, return a helpful error with degraded mode indicator
        console.error("Both verification methods failed:", rpcFallbackError);
        return {
          success: false,
          error: String(rpcFallbackError),
          hasPaymentTrigger: false,
          hasSalesTrigger: false,
          degradedMode: true
        };
      }
    }
  } catch (error) {
    console.error("Error in trigger check:", error);
    return { 
      success: false, 
      error: String(error),
      hasPaymentTrigger: false,
      hasSalesTrigger: false,
      degradedMode: true
    };
  }
}

/**
 * Manual calculation of reconciliation amounts as a fallback
 * Improved to better detect payments that need repair
 */
export async function manualRecalculateReconciliation(paymentId: string) {
  try {
    console.log("Manually recalculating reconciliation for payment:", paymentId);
    
    // Get payment details first
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
      
    if (paymentError) {
      console.error("Error fetching payment details:", paymentError);
      return { success: false, error: paymentError.message };
    }
    
    // Get all sales for this payment
    const { data: salesData, error: salesError } = await supabase
      .from('Sales')
      .select('id, price, orderNumber')
      .eq('reconciliation_id', paymentId);
      
    if (salesError) {
      console.error("Error fetching reconciled sales:", salesError);
      return { success: false, error: salesError.message };
    }
    
    console.log(`Found ${salesData?.length || 0} reconciled sales`);
    
    // Calculate totals
    const totalAmount = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
    const salesCount = salesData?.length || 0;
    
    // Check if repair is needed by comparing with current values
    const needsRepair = salesCount > 0 && (
      paymentData.reconciled_amount !== totalAmount || 
      paymentData.reconciled_count !== salesCount || 
      !paymentData.is_reconciled
    );
    
    if (!needsRepair) {
      console.log("Payment does not need repair:", { 
        id: paymentId,
        currentAmount: paymentData.reconciled_amount,
        calculatedAmount: totalAmount,
        currentCount: paymentData.reconciled_count,
        calculatedCount: salesCount
      });
      return { 
        success: true, 
        needsRepair: false,
        message: "El pago ya está correctamente reconciliado"
      };
    }
    
    console.log("Repairing payment:", { 
      id: paymentId,
      currentAmount: paymentData.reconciled_amount,
      calculatedAmount: totalAmount,
      currentCount: paymentData.reconciled_count,
      calculatedCount: salesCount
    });
    
    // Update the payment record with correct values
    const { data: updateResult, error: updateError } = await supabase
      .from('payments')
      .update({
        is_reconciled: salesCount > 0,
        reconciled_amount: totalAmount,
        reconciled_count: salesCount
      })
      .eq('id', paymentId)
      .select();
      
    if (updateError) {
      console.error("Error updating payment record:", updateError);
      return { success: false, error: updateError.message };
    }
    
    // Also update any sales that might be missing payment date
    const { error: salesUpdateError } = await supabase
      .from('Sales')
      .update({
        "statusPaid": 'cobrado',
        "datePaid": paymentData.date
      })
      .eq('reconciliation_id', paymentId)
      .is("datePaid", null);
      
    if (salesUpdateError) {
      console.warn("Warning: Could not update sales dates:", salesUpdateError);
    }
    
    return { 
      success: true,
      needsRepair: true,
      data: updateResult,
      reconciled_amount: totalAmount,
      reconciled_count: salesCount,
      sales: salesData?.map(s => s.orderNumber).join(', ')
    };
  } catch (error) {
    console.error("Error in manual recalculation:", error);
    return { success: false, error: String(error) };
  }
}
