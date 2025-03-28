
import { utils, read } from "xlsx";
import { formatDateValue } from "./dateUtils";

/**
 * Process an Excel file and extract expense data
 */
export const processExpenseFile = async (file: File) => {
  console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type);
  
  try {
    const data = await file.arrayBuffer();
    console.log("File converted to ArrayBuffer");
    
    const workbook = read(data);
    console.log("Workbook read, sheet names:", workbook.SheetNames);
    
    if (workbook.SheetNames.length === 0) {
      console.error("No sheets found in workbook");
      throw new Error("No se encontraron hojas en el archivo");
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log("First sheet accessed:", workbook.SheetNames[0]);
    
    if (!worksheet) {
      console.error("Worksheet is empty or invalid");
      throw new Error("Hoja de cálculo vacía o inválida");
    }
    
    const jsonData = utils.sheet_to_json(worksheet);
    console.log(`Extracted ${jsonData.length} rows from worksheet`);
    
    if (jsonData.length === 0) {
      console.warn("No data rows found in worksheet");
    } else {
      console.log("Sample first row:", jsonData[0]);
    }

    return jsonData.map((row: any, index: number) => {
      // Handle date conversion
      const formattedDate = formatDateValue(row.Fecha || row.date);
      
      const mappedRow = {
        date: formattedDate,
        description: row.Descripción || row.description || "",
        amount: row.Monto || row.amount || 0,
        account_id: row["ID Cuenta"] || row.account_id || "",
        chart_account_id: row["ID Cuenta Contable"] || row.chart_account_id || "",
        payment_method: (row["Método de Pago"] || row.payment_method || "cash").toLowerCase(),
        reference_number: row["Número de Referencia"] || row.reference_number || "",
        notes: row.Notas || row.notes || "",
        supplier_id: row["ID Proveedor"] || row.supplier_id || "",
        category: row.Categoría || row.category || "",
      };
      
      if (index === 0 || index === jsonData.length - 1 || index % 50 === 0) {
        console.log(`Mapped row ${index + 1}:`, mappedRow);
      }
      
      return mappedRow;
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw error;
  }
};
