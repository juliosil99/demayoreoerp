
import { utils, writeFile, read } from "xlsx";
import { format } from "date-fns";
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

export const createExcelTemplate = (
  bankAccounts: BankAccountsTable["Row"][] | undefined,
  chartAccounts: Account[] | undefined,
  suppliers: Supplier[] | undefined
) => {
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

  writeFile(wb, "plantilla_gastos.xlsx");
  toast.success("Plantilla descargada exitosamente");
};

export const processExpenseFile = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = utils.sheet_to_json(worksheet);

  return jsonData.map((row: any) => ({
    date: row.Fecha || row.date || format(new Date(), 'yyyy-MM-dd'),
    description: row.Descripción || row.description || "",
    amount: row.Monto || row.amount || 0,
    account_id: row["ID Cuenta"] || row.account_id || "",
    chart_account_id: row["ID Cuenta Contable"] || row.chart_account_id || "",
    payment_method: (row["Método de Pago"] || row.payment_method || "cash").toLowerCase(),
    reference_number: row["Número de Referencia"] || row.reference_number || "",
    notes: row.Notas || row.notes || "",
    supplier_id: row["ID Proveedor"] || row.supplier_id || "",
    category: row.Categoría || row.category || "",
  }));
};
