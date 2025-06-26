
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface BatchItem {
  id: string;
  item_id: string;
  item_type: string;
  description: string;
  amount: number;
  created_at: string;
}

interface BatchItemsListProps {
  expenseItems: BatchItem[];
  invoiceItems: BatchItem[];
}

export function BatchItemsList({ expenseItems, invoiceItems }: BatchItemsListProps) {
  const allItems = [
    ...expenseItems.map(item => ({ ...item, displayType: 'expense' as const })),
    ...invoiceItems.map(item => ({ ...item, displayType: 'invoice' as const }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (allItems.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No se encontraron items en este lote
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allItems.map((item) => (
        <div 
          key={`${item.item_type}-${item.item_id}`}
          className="flex justify-between items-center p-3 bg-background rounded border"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.displayType === 'expense' ? (
              <Receipt className="h-4 w-4 text-blue-600 flex-shrink-0" />
            ) : (
              <CreditCard className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant={item.displayType === 'expense' ? 'default' : 'secondary'} 
                  className="text-xs flex-shrink-0"
                >
                  {item.displayType === 'expense' ? 'Gasto' : 'Factura'}
                </Badge>
                <span className="font-medium text-sm truncate">
                  {item.description}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ID: {item.item_id}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 text-right">
            <span className="font-medium text-sm">
              {formatCurrency(item.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
