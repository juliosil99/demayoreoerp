
import { utils, writeFile } from "xlsx";
import { UnreconciledSale } from "../types/UnreconciledSale";
import { formatCurrency } from "@/utils/formatters";
import { formatDate } from "@/utils/formatters";

export const downloadReconciliationDetails = (sales: UnreconciledSale[]) => {
  // Prepare data for Excel
  const excelData = sales.map(sale => ({
    'Fecha': formatDate(sale.date),
    'Orden': sale.orderNumber,
    'Canal': sale.Channel,
    'Producto': sale.productName,
    'Monto': sale.price || 0,
    'Comisión': sale.comission || 0,
    'Envío': sale.shipping || 0,
    'Total Neto': (sale.price || 0) - (sale.comission || 0) - (sale.shipping || 0),
    'Tipo': sale.type === 'credit_note' ? 'Nota de Crédito' : 'Factura'
  }));

  // Create workbook and worksheet
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(excelData);

  // Add column widths
  ws['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 15 }, // Orden
    { wch: 15 }, // Canal
    { wch: 30 }, // Producto
    { wch: 12 }, // Monto
    { wch: 12 }, // Comisión
    { wch: 12 }, // Envío
    { wch: 12 }, // Total Neto
    { wch: 15 }, // Tipo
  ];

  utils.book_append_sheet(wb, ws, "Reconciliación");

  // Generate the file
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFile(wb, `reconciliacion-ventas-${timestamp}.xlsx`);
};
