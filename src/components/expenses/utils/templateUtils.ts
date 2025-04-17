
import { utils, writeFile } from "xlsx";
import { format } from "date-fns";
import { toast } from "sonner";
import { BankAccountsTable } from "@/integrations/supabase/types/bank-accounts";

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

/**
 * Create and download an Excel template for expense imports
 */
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
