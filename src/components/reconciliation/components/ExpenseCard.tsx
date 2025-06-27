
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCardDate, formatCurrency } from "@/utils/formatters";
import { CurrencyBadge } from "./CurrencyBadge";

interface ExpenseCardProps {
  expense: any;
  onSelectExpense: (expense: any) => void;
}

export function ExpenseCard({ expense, onSelectExpense }: ExpenseCardProps) {
  // Determinar el monto y currency que se va a mostrar SIEMPRE en moneda original
  const isUSD = expense.currency === 'USD';
  const originalAmount = isUSD ? expense.original_amount : expense.amount;
  const currency = expense.currency || 'MXN';

  // Variables auxiliares para distinguir si viene de CxP
  const isFromPayable = !!expense.accounts_payable;
  const hasPayableInvoice = isFromPayable && !!expense.accounts_payable.invoice_id;

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow h-full ${isFromPayable ? 'border-blue-200' : ''}`}>
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-sm line-clamp-2 flex-1">{expense.description}</h3>
            <div className="text-right shrink-0">
              <div className="font-bold text-base">
                {originalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
              <div className="text-xs text-gray-500">{formatCardDate(expense.date)}</div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Cuenta:</span>
              <span className="truncate ml-2">{expense.bank_accounts.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Método:</span>
              <span className="capitalize">
                {expense.payment_method === 'cash' ? 'Efectivo' :
                  expense.payment_method === 'transfer' ? 'Transferencia' :
                  expense.payment_method === 'check' ? 'Cheque' :
                  expense.payment_method === 'credit_card' ? 'TC' :
                    expense.payment_method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Proveedor:</span>
              <span className="truncate ml-2">
                {isFromPayable && expense.accounts_payable.client
                  ? expense.accounts_payable.client.name
                  : expense.contacts?.name || '-'}
              </span>
            </div>
            {expense.reference_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ref:</span>
                <span className="truncate ml-2">{expense.reference_number}</span>
              </div>
            )}
            {isFromPayable && (
              <div className="mt-1">
                <Badge className="w-full justify-center text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                  {hasPayableInvoice ? "CxP con Factura" : "Cuenta por Pagar"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button
          onClick={() => onSelectExpense(expense)}
          variant="default"
          size="sm"
          className="w-full text-xs"
        >
          Conciliar
        </Button>
      </CardFooter>
    </Card>
  );
}
