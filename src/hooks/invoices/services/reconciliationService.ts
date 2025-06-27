
import { supabase } from "@/integrations/supabase/client";

export const getReconciledInvoiceIds = async (): Promise<number[]> => {
  const { data: relations, error: relationsError } = await supabase
    .from('expense_invoice_relations')
    .select('invoice_id');
  
  if (relationsError) {
    console.error("Error fetching reconciled invoice IDs:", relationsError);
    throw relationsError;
  }
  
  return relations?.map(rel => rel.invoice_id) || [];
};
