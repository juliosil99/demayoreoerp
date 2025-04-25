
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCardDate } from "@/utils/formatters";
import type { UnreconciledSale } from "../hooks/useBulkReconciliation";

interface ReconciliationTableProps {
  sales?: UnreconciledSale[];
  isLoading: boolean;
}

export function ReconciliationTable({ sales, isLoading }: ReconciliationTableProps) {
  if (isLoading) {
    return <div className="text-center py-4">Cargando ventas...</div>;
  }

  if (!sales?.length) {
    return (
      <div className="text-center py-4 border rounded-md">
        No hay ventas sin reconciliar que coincidan con los filtros.
      </div>
    );
  }

  // Calculate total amount
  const totalAmount = sales.reduce((sum, sale) => {
    const amount = sale.type === 'E' ? -1 * (sale.price || 0) : (sale.price || 0);
    return sum + amount;
  }, 0);

  // Calculate totals by type
  const regularInvoices = sales.filter(sale => sale.type !== 'E');
  const creditNotes = sales.filter(sale => sale.type === 'E');

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Total Facturas</p>
          <p className="text-lg font-semibold">{regularInvoices.length}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Total Notas de Crédito</p>
          <p className="text-lg font-semibold">{creditNotes.length}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-600">Monto Total a Reconciliar</p>
        <p className="text-xl font-semibold">
          ${Math.abs(totalAmount).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
