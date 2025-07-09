
import { supabase } from "@/integrations/supabase/client";
import { FailedImport } from "../types";
import { transformSalesRowToDbFormat, validateSalesRow } from "./dataTransformer";
import { handleImportError } from "./errorHandler";
import { showImportToasts } from "./toastNotifier";
import { ProcessingResult } from "./fileProcessor";

export const processImportData = async (
  salesRows: Record<string, any>[],
  onProgress?: (currentRow: number) => void
): Promise<ProcessingResult> => {
  let successCount = 0, errorCount = 0;
  const newFailedImports: FailedImport[] = [];

  // Get the user's company_id first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  // Get company_id from company_users or companies table
  const { data: companyData } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  let company_id: string;
  if (companyData) {
    company_id = companyData.company_id;
  } else {
    // If not in company_users, check if user owns a company
    const { data: ownedCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();
    
    if (!ownedCompany) {
      throw new Error("Usuario no pertenece a ninguna empresa");
    }
    company_id = ownedCompany.id;
  }

  for (let index = 0; index < salesRows.length; index++) {
    const row = salesRows[index];
    try {
      if (onProgress) {
        onProgress(index + 1);
      }
      
      console.log(`Processing row ${index + 2}:`, row);
      
      const salesData = transformSalesRowToDbFormat(row, company_id) as any;
      console.log(`Transformed data for row ${index + 2}:`, salesData);
      
      const validation = validateSalesRow(salesData);
      
      if (!validation.valid) {
        handleImportError(row, validation.reason, index + 2, newFailedImports);
        errorCount++;
        continue;
      }

      // Insert with explicit field names to maintain case sensitivity
      const { error } = await supabase
        .from("Sales")
        .insert(salesData);
        
      if (error) {
        console.error(`Error inserting row ${index + 2}:`, error);
        handleImportError(
          row, 
          `Error de base de datos: ${error.message}`, 
          index + 2, 
          newFailedImports
        );
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Error processing row ${index + 2}:`, err);
      handleImportError(
        row,
        `Error al procesar: ${err instanceof Error ? err.message : 'Desconocido'}`,
        index + 2,
        newFailedImports
      );
      errorCount++;
    }
  }

  showImportToasts(successCount, errorCount);

  return {
    successCount,
    errorCount,
    shouldClose: errorCount === 0 && successCount > 0,
    failedImports: newFailedImports
  };
};
