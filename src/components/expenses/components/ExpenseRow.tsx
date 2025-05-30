
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCardDate, formatCurrency } from "@/utils/formatters";
import { ExpenseActions } from "./ExpenseActions";
import type { Expense } from "./types";

interface ExpenseRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
}

export function ExpenseRow({ 
  expense,
  onDelete,
  onEdit,
}: ExpenseRowProps) {

  // Create wrapper functions to handle the proper signature
  const handleDelete = () => onDelete(expense);
  const handleEdit = () => onEdit(expense);

  // Check if this is a refund/return (negative amount)
  const isReturn = expense.amount < 0;

  return (
    <TableRow key={expense.id} className={!!expense.accounts_payable ? "bg-gray-50" : "odd:bg-white even:bg-gray-50"}>
      <TableCell className="whitespace-nowrap">{formatCardDate(expense.date)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 max-w-[250px] md:max-w-none">
          <span className="truncate">{expense.description}</span>
          {!!expense.accounts_payable && (
            <Badge className="bg-blue-200 text-blue-800 rounded-full px-2 py-1 text-xs shrink-0">
              CxP
            </Badge>
          )}
          {isReturn && (
            <Badge className="bg-red-200 text-red-800 rounded-full px-2 py-1 text-xs shrink-0">
              Reembolso
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium whitespace-nowrap">
        {expense.currency !== 'MXN' ? (
          <>
            {expense.currency} {formatCurrency(Math.abs(expense.original_amount), expense.currency)}
            <div className={`text-xs ${isReturn ? "text-red-600" : "text-muted-foreground"}`}>
              {isReturn ? "- " : ""}MXN {formatCurrency(Math.abs(expense.amount))}
            </div>
          </>
        ) : (
          <span className={isReturn ? "text-red-600" : ""}>
            {isReturn ? "- " : ""}{formatCurrency(Math.abs(expense.amount))}
          </span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">{expense.bank_accounts.name}</TableCell>
      <TableCell>
        <span className="whitespace-nowrap">
          {expense.chart_of_accounts.code} - {expense.chart_of_accounts.name}
        </span>
      </TableCell>
      <TableCell className="max-w-[150px]">
        <div className="truncate">{getRecipientDisplay()}</div>
      </TableCell>
      <TableCell className="capitalize whitespace-nowrap">
        {expense.payment_method === 'cash' ? 'Efectivo' :
          expense.payment_method === 'transfer' ? 'Transferencia' :
          expense.payment_method === 'check' ? 'Cheque' :
          expense.payment_method === 'credit_card' ? 'TC' :
          expense.payment_method.replace('_', ' ')}
      </TableCell>
      <TableCell>{expense.reference_number || '-'}</TableCell>
      <TableCell className="max-w-[150px]">
        <div className="truncate">
          {expense.expense_invoice_relations?.length ? 
            expense.expense_invoice_relations.map(relation => 
              relation.invoice.invoice_number || relation.invoice.uuid
            ).join(', ') : 
            expense.reconciled ? 'Conciliación manual' : 'Sin conciliar'}
        </div>
      </TableCell>
      <TableCell>
        <ExpenseActions 
          expense={expense}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </TableCell>
    </TableRow>
  );

  function getRecipientDisplay() {
    const isFromPayable = !!expense.accounts_payable;
    const recipientType = expense.contacts?.type || 'supplier';
    
    if (isFromPayable && expense.accounts_payable?.client?.name) {
      return (
        <>
          {expense.accounts_payable.client.name} <Badge variant="outline" className="ml-1 text-xs">CxP</Badge>
        </>
      );
    }
    
    if (expense.contacts?.name) {
      const name = expense.contacts.name;
      if (recipientType === 'employee') {
        return (
          <>
            {name} <Badge variant="outline" className="ml-1 text-xs">Empleado</Badge>
          </>
        );
      }
      return name;
    }
    
    return '-';
  }
}
