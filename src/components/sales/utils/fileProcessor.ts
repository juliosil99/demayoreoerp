
import { read, utils } from "xlsx";
import { FailedImport } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { transformSalesRowToDbFormat, validateSalesRow } from "./dataTransformer";
import { toast } from "@/hooks/use-toast";

export const processFile = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return utils.sheet_to_json(worksheet) as Record<string, any>[];
};

export interface ProcessingResult {
  successCount: number;
  errorCount: number;
  shouldClose: boolean;
  failedImports: FailedImport[];
}

export const processImportData = async (salesRows: Record<string, any>[]): Promise<ProcessingResult> => {
  let successCount = 0, errorCount = 0;
  const newFailedImports: FailedImport[] = [];

  for (let index = 0; index < salesRows.length; index++) {
    const row = salesRows[index];
    try {
      const salesData = transformSalesRowToDbFormat(row);
      const validation = validateSalesRow(salesData);
      
      if (!validation.valid) {
        newFailedImports.push({
          rowData: row,
          reason: validation.reason,
          rowIndex: index + 2
        });
        errorCount++;
        continue;
      }
      
      const { error } = await supabase.from("Sales").insert(salesData);
        
      if (error) {
        newFailedImports.push({
          rowData: row,
          reason: `Error de base de datos: ${error.message}`,
          rowIndex: index + 2
        });
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      newFailedImports.push({
        rowData: row,
        reason: `Error al procesar: ${err instanceof Error ? err.message : 'Desconocido'}`,
        rowIndex: index + 2
      });
      errorCount++;
    }
  }

  if (successCount > 0) {
    toast({
      title: "Importación Exitosa",
      description: `${successCount} ventas importadas exitosamente.`,
    });
  }
  
  if (errorCount > 0) {
    toast({
      title: "Error",
      description: `${errorCount} ventas no pudieron importarse.`,
      variant: "destructive"
    });
  }

  return {
    successCount,
    errorCount,
    shouldClose: errorCount === 0 && successCount > 0,
    failedImports: newFailedImports
  };
};
