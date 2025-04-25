
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
      const salesData = transformSalesRowToDbFormat(row);
      const validation = validateSalesRow(salesData);
      
      if (!validation.valid) {
        handleImportError(row, validation.reason, index + 2, newFailedImports);
        errorCount++;
        continue;
      }
      
      const { error } = await supabase.from("Sales").insert(salesData);
        
      if (error) {
        handleImportError(row, `Error de base de datos: ${error.message}`, index + 2, newFailedImports);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
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
