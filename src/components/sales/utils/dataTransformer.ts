
/**
 * Utility functions for transforming and validating data before inserting into Supabase
 */
import { SalesBase } from "@/integrations/supabase/types/sales";
import { validateSalesData } from "./salesValidation";

/**
 * Safely converts a value to string, returning null if the value is null or undefined
 */
const toSafeString = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return String(value);
};

/**
 * Safely converts a value to number, returning null if the value is not a valid number
 */
const toSafeNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * Safely converts a status value to the proper type, ensuring it's either "pending", "paid", or null
 */
const toSafeStatus = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const status = String(value).toLowerCase();
  return status === "paid" || status === "cobrado" || status === "pagado" ? "paid" : "pending";
};

/**
 * Transforms raw Excel/CSV row data into a properly typed SalesBase object for Supabase
 */
export const transformSalesRowToDbFormat = (row: Record<string, any>): Partial<SalesBase> => {
  console.log('Raw row data:', row); // Debug log to see incoming data

  // Create the object with explicit property names matching the database schema
  const transformedData: Partial<SalesBase> = {
    // String fields with explicit case handling
    category: toSafeString(row.Categoria || row.category),
    Channel: toSafeString(row.Canal || row.Channel),
    city: toSafeString(row.Ciudad || row.city),
    date: toSafeString(row.Fecha || row.date),
    datePaid: toSafeString(row["Fecha de Pago"] || row.datePaid),
    hour: toSafeString(row.Hora || row.hour),
    invoice: toSafeString(row.Factura || row.invoice),
    invoiceDate: toSafeString(row["Fecha Factura"] || row.invoiceDate),
    orderNumber: toSafeString(row["No. Orden"] || row.orderNumber),
    postalCode: toSafeString(row["Código Postal"] || row.postalCode),
    productName: toSafeString(row.Producto || row.productName), // Explicitly set with correct case
    sku: toSafeString(row.SKU || row.sku),
    state: toSafeString(row["Estado/Provincia"] || row.state),
    statusPaid: toSafeStatus(row["Estatus de Pago"] || row.statusPaid),
    supplierName: toSafeString(row["Nombre Proveedor"] || row.supplierName),
    
    // Number fields
    comission: toSafeNumber(row.Comisión || row.comission),
    cost: toSafeNumber(row.Costo || row.cost),
    idClient: toSafeNumber(row["ID Cliente"] || row.idClient),
    price: toSafeNumber(row.Monto || row.price),
    Profit: toSafeNumber(row.Ganancia || row.Profit),
    profitMargin: toSafeNumber(row.Margen || row.profitMargin),
    Quantity: toSafeNumber(row.Cantidad || row.Quantity),
    retention: toSafeNumber(row.Retención || row.retention),
    shipping: toSafeNumber(row.Envío || row.shipping),
  };

  console.log('Transformed data:', transformedData); // Debug log to verify transformation
  return transformedData;
};

export { validateSalesData as validateSalesRow };
