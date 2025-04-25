
import { supabase } from "@/integrations/supabase/client";
import { FailedImport } from "../types";
import { transformSalesRowToDbFormat, validateSalesRow } from "./dataTransformer";
import { handleImportError } from "./errorHandler";
import { showImportToasts } from "./toastNotifier";
import { ProcessingResult } from "./fileProcessor";
import { SalesBase } from "@/integrations/supabase/types/sales";

export const processImportData = async (salesRows: Record<string, any>[]): Promise<ProcessingResult> => {
  let successCount = 0, errorCount = 0;
  const newFailedImports: FailedImport[] = [];

  for (let index = 0; index < salesRows.length; index++) {
    const row = salesRows[index];
    try {
      console.log(`Processing row ${index + 2}:`, row); // Debug log
      
      const salesData = transformSalesRowToDbFormat(row);
      console.log(`Transformed data for row ${index + 2}:`, salesData); // Debug log
      
      const validation = validateSalesRow(salesData);
      
      if (!validation.valid) {
        handleImportError(row, validation.reason, index + 2, newFailedImports);
        errorCount++;
        continue;
      }
      
      // Using an object with explicit field names to ensure case sensitivity is preserved
      // We're using the PostgreSQL-preferred format with quoted identifiers
      const { error } = await supabase
        .from("Sales")
        .insert({
          "category": salesData.category,
          "Channel": salesData.Channel,
          "city": salesData.city,
          "comission": salesData.comission,
          "cost": salesData.cost,
          "date": salesData.date,
          "datePaid": salesData.datePaid,
          "hour": salesData.hour,
          "idClient": salesData.idClient,
          "invoice": salesData.invoice,
          "invoiceDate": salesData.invoiceDate,
          "orderNumber": salesData.orderNumber,
          "postalCode": salesData.postalCode,
          "price": salesData.price,
          "productName": salesData.productName, // This ensures exact case preservation
          "Profit": salesData.Profit,
          "profitMargin": salesData.profitMargin,
          "Quantity": salesData.Quantity,
          "retention": salesData.retention,
          "shipping": salesData.shipping,
          "sku": salesData.sku,
          "state": salesData.state,
          "statusPaid": salesData.statusPaid,
          "supplierName": salesData.supplierName
        });
        
      if (error) {
        console.error(`Error inserting row ${index + 2}:`, error); // Debug log
        handleImportError(
          row, 
          `Error de base de datos: ${error.message} (Details: ${JSON.stringify(error.details)})`, 
          index + 2, 
          newFailedImports
        );
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Error processing row ${index + 2}:`, err); // Debug log
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
