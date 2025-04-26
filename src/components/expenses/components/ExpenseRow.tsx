import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCardDate, formatCurrency } from "@/utils/formatters";
import { ExpenseActions } from "./ExpenseActions";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string; type?: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
  accounts_payable?: {
    id: string;
    client: {
      name: string;
    };
  };
};

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

  const handleDeleteClick = async () => {
    return onDelete(expense);
  };

  const handleEditClick = () => {
    onEdit(expense);
  };

  const isFromPayable = !!expense.accounts_payable;
  
  const recipientType = expense.contacts?.type || 'supplier';
  
  const getRecipientDisplay = () => {
    if (isFromPayable && expense.accounts_payable?.client?.name) {
      return expense.accounts_payable.client.name;
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
  };

  return (
    <TableRow key={expense.id} className={isFromPayable ? "bg-gray-300" : "odd:bg-gray-300 even:bg-gray-300"}>
      <TableCell className="whitespace-nowrap">{formatCardDate(expense.date)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 max-w-[250px] md:max-w-none">
          <span className="truncate">{expense.description}</span>
          {isFromPayable && (
            <Badge className="bg-blue-200 text-blue-800 rounded-full px-2 py-1 text-xs shrink-0">
              CxP
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium whitespace-nowrap">
        {formatCurrency(expense.amount)}
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
          onDelete={handleDeleteClick}
          onEdit={handleEditClick}
        />
      </TableCell>
    </TableRow>
  );
}
