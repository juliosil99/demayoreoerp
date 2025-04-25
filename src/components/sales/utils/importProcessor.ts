
import { supabase } from "@/integrations/supabase/client";
import { FailedImport } from "../types";
import { transformSalesRowToDbFormat, validateSalesRow } from "./dataTransformer";
import { handleImportError } from "./errorHandler";
import { showImportToasts } from "./toastNotifier";
import { ProcessingResult } from "./fileProcessor";

export const processImportData = async (salesRows: Record<string, any>[]): Promise<ProcessingResult> => {
  let successCount = 0, errorCount = 0;
  const newFailedImports: FailedImport[] = [];

  for (let index = 0; index < salesRows.length; index++) {
    const row = salesRows[index];
    try {
      console.log(`Processing row ${index + 2}:`, row);
      
      const salesData = transformSalesRowToDbFormat(row);
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
