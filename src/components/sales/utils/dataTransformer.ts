
/**
 * Utility functions for transforming and validating data before inserting into Supabase
 */
import { SalesBase } from "@/integrations/supabase/types/sales";

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
const toSafeStatus = (value: any): "pending" | "paid" | null => {
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
  console.log('Transforming row:', row); // Debug log
  
  return {
    // String fields with Spanish column names as primary and English as fallback
    category: toSafeString(row.Categoria || row.category),
    channel: toSafeString(row.Canal || row.Channel), // Updated to lowercase 'channel'
    city: toSafeString(row.Ciudad || row.city),
    date: toSafeString(row.Fecha || row.date),
    datepaid: toSafeString(row["Fecha de Pago"] || row.datePaid), // Updated to lowercase 'datepaid'
    hour: toSafeString(row.Hora || row.hour),
    invoice: toSafeString(row.Factura || row.invoice),
    invoicedate: toSafeString(row["Fecha Factura"] || row.invoiceDate), // Updated to lowercase 'invoicedate'
    ordernumber: toSafeString(row["No. Orden"] || row.orderNumber), // Updated to lowercase 'ordernumber'
    postalcode: toSafeString(row["Código Postal"] || row.postalCode), // Updated to lowercase 'postalcode'
    productname: toSafeString(row.Producto || row.productName), // Updated to lowercase 'productname'
    sku: toSafeString(row.SKU || row.sku),
    state: toSafeString(row["Estado/Provincia"] || row.state), // Geographic state
    statuspaid: toSafeStatus(row["Estatus de Pago"] || row.statusPaid), // Updated to lowercase 'statuspaid'
    suppliername: toSafeString(row["Nombre Proveedor"] || row.supplierName), // Updated to lowercase 'suppliername'
    
    // Number fields with Spanish column names as primary and English as fallback
    comission: toSafeNumber(row.Comisión || row.comission),
    cost: toSafeNumber(row.Costo || row.cost),
    idclient: toSafeNumber(row["ID Cliente"] || row.idClient), // Updated to lowercase 'idclient'
    price: toSafeNumber(row.Monto || row.price),
    profit: toSafeNumber(row.Ganancia || row.Profit), // Updated to lowercase 'profit'
    profitmargin: toSafeNumber(row.Margen || row.profitMargin), // Updated to lowercase 'profitmargin'
    quantity: toSafeNumber(row.Cantidad || row.Quantity), // Updated to lowercase 'quantity'
    retention: toSafeNumber(row.Retención || row.retention),
    shipping: toSafeNumber(row.Envío || row.shipping),
  };
};

/**
 * Validates if the transformed data contains the minimum required fields
 */
export const validateSalesRow = (data: Partial<SalesBase>): { valid: boolean; reason: string } => {
  if (!data.date) {
    return { valid: false, reason: 'Fecha es requerida' };
  }
  if (!data.ordernumber) { // Updated to match lowercase field name
    return { valid: false, reason: 'No. Orden es requerido' };
  }
  if (data.price === null && data.price !== 0) {
    return { valid: false, reason: 'Monto es requerido' };
  }
  
  return { valid: true, reason: '' };
};
