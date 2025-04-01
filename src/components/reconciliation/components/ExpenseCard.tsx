
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCardDate, formatCurrency } from "@/utils/formatters";

interface ExpenseCardProps {
  expense: any;
  onSelectExpense: (expense: any) => void;
}

export function ExpenseCard({ expense, onSelectExpense }: ExpenseCardProps) {
  // Check if this expense is from a payable
  const isFromPayable = !!expense.accounts_payable;
  
  // Check if this expense is from a payable with an invoice
  const hasPayableInvoice = isFromPayable && !!expense.accounts_payable.invoice_id;

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${isFromPayable ? 'border-blue-200' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg line-clamp-2">{expense.description}</h3>
            <div className="flex flex-col items-end">
              <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
              <span className="text-sm text-gray-500">{formatCardDate(expense.date)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Cuenta:</span>
              <span className="text-sm">{expense.bank_accounts.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Método:</span>
              <span className="text-sm capitalize">
                {expense.payment_method === 'cash' ? 'Efectivo' :
                 expense.payment_method === 'transfer' ? 'Transferencia' :
                 expense.payment_method === 'check' ? 'Cheque' :
                 expense.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
                 expense.payment_method}
              </span>
            </div>
            {expense.reference_number && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Referencia:</span>
                <span className="text-sm">{expense.reference_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Proveedor:</span>
              <span className="text-sm">
                {isFromPayable && expense.accounts_payable.client 
                  ? expense.accounts_payable.client.name 
                  : expense.contacts?.name || '-'}
              </span>
            </div>
            
            {isFromPayable && (
              <div className="mt-2">
                <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                  {hasPayableInvoice 
                    ? "Cuenta por Pagar con Factura" 
                    : "Cuenta por Pagar"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onSelectExpense(expense)} 
          variant="default" 
          className="w-full"
        >
          Conciliar Gasto
        </Button>
      </CardFooter>
    </Card>
  );
}
