
import { supabase } from "./client";

/**
 * Checks for the existence of necessary triggers for the reconciliation process
 * Uses the check-triggers edge function to query the database
 */
export async function checkReconciliationTriggers() {
  try {
    // Call the edge function instead of using RPC
    const { data, error } = await supabase.functions.invoke("check-triggers", {
      method: "POST"
    });
    
    if (error) {
      console.error("Error checking triggers:", error);
      return { success: false, error: error.message };
    }
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error("No trigger data returned or data is not in expected format");
      return { success: false, error: "Invalid data format from edge function" };
    }
    
    return { 
      success: true, 
      data: data.data,
      hasPaymentTrigger: data.hasPaymentTrigger,
      hasSalesTrigger: data.hasSalesTrigger
    };
  } catch (error) {
    console.error("Error in trigger check:", error);
    return { success: false, error: String(error) };
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
