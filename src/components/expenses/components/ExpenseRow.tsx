
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCardDate, formatCurrency } from "@/utils/formatters";
import { ExpenseActions } from "./ExpenseActions";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const navigate = useNavigate();

  // Create wrapper functions to handle the proper signature
  const handleDelete = () => onDelete(expense);
  const handleEdit = () => onEdit(expense);

  // Check if this is a refund/return (negative amount)
  const isReturn = expense.amount < 0;

  const handleBatchClick = () => {
    if (expense.reconciliation_batch_id) {
      navigate(`/expenses/reconciliation-batches?batch=${expense.reconciliation_batch_id}`);
    }
  };

  const handleInvoiceDownload = async (invoiceId: number, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(`invoices/${invoiceId}/${filename}`, 60);

      if (error) {
        console.error('Error creating signed URL:', error);
        toast.error('Error al descargar la factura');
        return;
      }

      // Open the file in a new tab for download
      window.open(data.signedUrl, '_blank');
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Error al descargar la factura');
    }
  };

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
          {getReconciliationStatus()}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ExpenseActions 
            expense={expense}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          {/* Show download button if expense has invoice relations */}
          {expense.expense_invoice_relations && expense.expense_invoice_relations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const relation = expense.expense_invoice_relations[0];
                handleInvoiceDownload(relation.invoice.id, relation.invoice.filename);
              }}
              className="h-8 w-8 p-0"
              title="Descargar factura"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
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

  function getReconciliationStatus() {
    // Check if it's part of a batch reconciliation
    if (expense.reconciliation_batch_id) {
      return (
        <div className="flex items-center gap-1">
          <Badge 
            className="bg-purple-100 text-purple-800 text-xs cursor-pointer hover:bg-purple-200 transition-colors"
            onClick={handleBatchClick}
          >
            Lote de Reconciliación
          </Badge>
        </div>
      );
    }

    // Check for invoice relations
    if (expense.expense_invoice_relations?.length) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm">
            {expense.expense_invoice_relations.map(relation => 
              relation.invoice.invoice_number || relation.invoice.uuid.substring(0, 8)
            ).join(', ')}
          </span>
          <Badge className="bg-green-100 text-green-800 text-xs">
            Conciliado
          </Badge>
        </div>
      );
    }

    // Check for manual reconciliation
    if (expense.reconciled) {
      return (
        <Badge className="bg-blue-100 text-blue-800 text-xs">
          Conciliación manual
        </Badge>
      );
    }

    return 'Sin conciliar';
  }
}
