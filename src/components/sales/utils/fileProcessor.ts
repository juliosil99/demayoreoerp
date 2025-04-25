
import { read, utils } from "xlsx";
import { FailedImport } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { transformSalesRowToDbFormat, validateSalesRow } from "./dataTransformer";
import { processImportData } from "./importProcessor";

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

export { processImportData };
