
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
      
      return { 
        success: true, 
        data: data.data,
        hasPaymentTrigger: data.hasPaymentTrigger,
        hasSalesTrigger: data.hasSalesTrigger
      };
    } catch (edgeFunctionError) {
      // Second attempt: Fall back to direct RPC call
      console.log("Edge function failed, falling back to RPC call...", edgeFunctionError);
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('list_triggers_for_reconciliation');
      
      if (rpcError) {
        console.error("Both edge function and RPC fallback failed:", rpcError);
        return { 
          success: false, 
          error: `Trigger verification failed: ${rpcError.message || String(edgeFunctionError)}` 
        };
      }
      
      // Process the data similar to how the edge function would
      const hasPaymentTrigger = rpcData.some((t: any) => 
        t.trigger_name?.toLowerCase().includes('payment') && 
        t.event_manipulation === 'UPDATE'
      );
      
      const hasSalesTrigger = rpcData.some((t: any) => 
        t.trigger_name?.toLowerCase().includes('sale') && 
        t.event_manipulation === 'UPDATE'
      );
      
      console.log("RPC fallback succeeded, using direct database response");
      
      return { 
        success: true, 
        data: rpcData,
        hasPaymentTrigger,
        hasSalesTrigger,
        usedFallback: true
      };
    }
  } catch (error) {
    console.error("Error in trigger check:", error);
    return { 
      success: false, 
      error: String(error),
      hasPaymentTrigger: false,
      hasSalesTrigger: false
    };
  }
}

/**
 * Manual calculation of reconciliation amounts as a fallback
 */
export async function manualRecalculateReconciliation(paymentId: string) {
  try {
    console.log("Manually recalculating reconciliation for payment:", paymentId);
    
    // Get all sales for this payment
    const { data: salesData, error: salesError } = await supabase
      .from('Sales')
      .select('id, price')
      .eq('reconciliation_id', paymentId);
      
    if (salesError) {
      console.error("Error fetching reconciled sales:", salesError);
      return { success: false, error: salesError.message };
    }
    
    console.log(`Found ${salesData?.length || 0} reconciled sales`);
    
    // Calculate totals
    const totalAmount = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
    const salesCount = salesData?.length || 0;
    
    // Update the payment record
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
    
    return { 
      success: true, 
      data: updateResult,
      reconciled_amount: totalAmount,
      reconciled_count: salesCount
    };
  } catch (error) {
    console.error("Error in manual recalculation:", error);
    return { success: false, error: String(error) };
  }
}
