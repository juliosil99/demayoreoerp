import { utils, writeFile, read } from "xlsx";
import { format, addDays } from "date-fns";
import { BankAccountsTable } from "@/integrations/supabase/types/bank-accounts";
import { toast } from "sonner";

interface Account {
  id: string;
  code: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
  rfc: string | null;
}

// Excel dates are stored as days since 1900-01-01 (with a couple of quirks)
// This function converts Excel's numeric date to a proper JS Date
function excelDateToJSDate(excelDate: number): Date {
  // Excel's date system starts on January 1, 1900
  // Excel has a leap year bug where it thinks 1900 is a leap year
  // We need to create the correct base date for January 1, 1900
  const baseDate = new Date(Date.UTC(1900, 0, 1)); // January 1, 1900 in UTC
  
  // Excel incorrectly treats 1900 as a leap year, adding a non-existent Feb 29
  // For dates after February 28, 1900 (day 59 in Excel), we need to subtract a day
  const adjustedExcelDate = excelDate > 60 ? excelDate - 1 : excelDate;
  
  // Excel dates are 1-based (day 1 is January 1, 1900)
  // But JavaScript dates are 0-based from the baseDate
  // So we subtract 1 from the Excel date value
  const daysSinceBaseDate = adjustedExcelDate - 1;
  
  // Add the number of days to the base date
  const resultDate = new Date(baseDate);
  resultDate.setUTCDate(baseDate.getUTCDate() + daysSinceBaseDate);
  
  return resultDate;
}

export const createExcelTemplate = (
  bankAccounts: BankAccountsTable["Row"][] | undefined,
  chartAccounts: Account[] | undefined,
  suppliers: Supplier[] | undefined
) => {
  console.log("Creating Excel template with data sources:", {
    bankAccounts: bankAccounts?.length || 0,
    chartAccounts: chartAccounts?.length || 0, 
    suppliers: suppliers?.length || 0
  });
  
  const wb = utils.book_new();

  // Main expense sheet
  const headers = [
    'Fecha',
    'Descripción',
    'Monto',
    'ID Cuenta',
    'ID Cuenta Contable',
    'Método de Pago',
    'Número de Referencia',
    'Notas',
    'ID Proveedor',
    'Categoría'
  ];

  const exampleData = [
    {
      'Fecha': format(new Date(), 'yyyy-MM-dd'),
      'Descripción': 'Ejemplo de Gasto',
      'Monto': '1000.00',
      'ID Cuenta': '1',
      'ID Cuenta Contable': 'UUID-de-la-cuenta',
      'Método de Pago': 'cash',
      'Número de Referencia': 'REF123',
      'Notas': 'Ejemplo de notas',
      'ID Proveedor': 'UUID-del-proveedor',
      'Categoría': 'Servicios'
    }
  ];

  const wsMain = utils.json_to_sheet(exampleData, { header: headers });
  utils.book_append_sheet(wb, wsMain, "Gastos");

  // Bank accounts sheet
  const bankAccountsData = bankAccounts?.map(account => ({
    'ID Cuenta': account.id,
    'Nombre de Cuenta': account.name,
  })) || [];
  const wsBankAccounts = utils.json_to_sheet(bankAccountsData);
  utils.book_append_sheet(wb, wsBankAccounts, "Cuentas Bancarias");

  // Chart accounts sheet
  const chartAccountsData = chartAccounts?.map(account => ({
    'ID Cuenta Contable': account.id,
    'Código': account.code,
    'Nombre': account.name,
  })) || [];
  const wsChartAccounts = utils.json_to_sheet(chartAccountsData);
  utils.book_append_sheet(wb, wsChartAccounts, "Cuentas Contables");

  // Suppliers sheet
  const suppliersData = suppliers?.map(supplier => ({
    'ID Proveedor': supplier.id,
    'Nombre': supplier.name,
    'RFC': supplier.rfc || '',
  })) || [];
  const wsSuppliers = utils.json_to_sheet(suppliersData);
  utils.book_append_sheet(wb, wsSuppliers, "Proveedores");

  // Payment methods sheet
  const paymentMethodsData = [
    { 'Código': 'cash', 'Descripción': 'Efectivo' },
    { 'Código': 'transfer', 'Descripción': 'Transferencia' },
    { 'Código': 'check', 'Descripción': 'Cheque' },
    { 'Código': 'credit_card', 'Descripción': 'Tarjeta de Crédito' },
  ];
  const wsPaymentMethods = utils.json_to_sheet(paymentMethodsData);
  utils.book_append_sheet(wb, wsPaymentMethods, "Métodos de Pago");

  try {
    writeFile(wb, "plantilla_gastos.xlsx");
    console.log("Template file created and downloaded successfully");
    toast.success("Plantilla descargada exitosamente");
  } catch (error) {
    console.error("Error writing Excel file:", error);
    toast.error("Error al generar la plantilla");
  }
};

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
      let formattedDate;
      
      // Handle date conversion
      if (row.Fecha || row.date) {
        const dateValue = row.Fecha || row.date;
        
        // Check if it's a numeric Excel date
        if (typeof dateValue === 'number') {
          console.log(`Converting Excel numeric date ${dateValue} for row ${index + 1}`);
          const jsDate = excelDateToJSDate(dateValue);
          formattedDate = format(jsDate, 'yyyy-MM-dd');
          console.log(`Converted date: ${formattedDate}`);
        } else {
          // Handle string date formats
          formattedDate = dateValue;
        }
      } else {
        formattedDate = format(new Date(), 'yyyy-MM-dd');
      }
      
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
