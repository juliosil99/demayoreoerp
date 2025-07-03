
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatters";
import { UnreconciledSale } from "../types/UnreconciledSale";

interface SalesSelectionManagerProps {
  sales: UnreconciledSale[] | undefined;
  selectedSales: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

export function SalesSelectionManager({ 
  sales, 
  selectedSales,
  onSelectionChange 
}: SalesSelectionManagerProps) {
  const handleSelectAll = () => {
    if (!sales) return;
    if (selectedSales.length === sales.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sales.map(sale => sale.id));
    }
  };

  const handleSelectSale = (saleId: number) => {
    if (selectedSales.includes(saleId)) {
      onSelectionChange(selectedSales.filter(id => id !== saleId));
    } else {
      onSelectionChange([...selectedSales, saleId]);
    }
  };

  if (!sales?.length) return null;

  const selectedAmount = sales
    .filter(sale => selectedSales.includes(sale.id))
    .reduce((sum, sale) => sum + (sale.price || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={sales.length > 0 && selectedSales.length === sales.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedSales.length} de {sales.length} ventas seleccionadas
          </span>
        </div>
        <span className="text-sm font-medium">
          Total seleccionado: {formatCurrency(selectedAmount)}
        </span>
      </div>
    </div>
  );
}
