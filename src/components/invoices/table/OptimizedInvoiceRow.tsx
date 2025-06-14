
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { FileText, Check, X, Link, Unlink, CheckCircle, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/formatters";
import { 
  formatInvoiceAmount,
  formatInvoiceTaxAmount,
  formatInvoiceNumber
} from "@/utils/invoiceFormatters";
import { InvoiceTypeBadge } from "@/components/invoices/InvoiceTypeBadge";
import { ManualReconciliationDialog } from "@/components/invoices/ManualReconciliationDialog";
import { useManualInvoiceReconciliation } from "@/hooks/invoices/useManualInvoiceReconciliation";

type PartialInvoice = Partial<Database["public"]["Tables"]["invoices"]["Row"]> & { 
  is_reconciled?: boolean;
  reconciliation_type?: 'automatic' | 'manual' | null;
};

interface OptimizedInvoiceRowProps {
  invoice: PartialInvoice;
}

export const OptimizedInvoiceRow: React.FC<OptimizedInvoiceRowProps> = ({ invoice }) => {
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const { markAsReconciled, unmarkAsReconciled, isLoading } = useManualInvoiceReconciliation();

  const getStatusIcon = (status: string | null | undefined) => {
    if (status === 'completed') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'error') return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getReconciliationBadge = (isReconciled: boolean | undefined, reconciliationType: 'automatic' | 'manual' | null | undefined) => {
    if (isReconciled) {
      if (reconciliationType === 'manual') {
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Manual
          </Badge>
        );
      } else {
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <Link className="h-3 w-3 mr-1" />
            Reconciliada
          </Badge>
        );
      }
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
          <Unlink className="h-3 w-3 mr-1" />
          Sin reconciliar
        </Badge>
      );
    }
  };

  const handleMarkAsReconciled = async (notes?: string) => {
    if (invoice.id) {
      await markAsReconciled(invoice.id, notes);
    }
  };

  const handleUnmarkAsReconciled = async () => {
    if (invoice.id) {
      await unmarkAsReconciled(invoice.id);
    }
  };

  const canMarkManually = !invoice.is_reconciled;
  const canUnmarkManually = invoice.is_reconciled && invoice.reconciliation_type === 'manual';

  return (
    <>
      <TableRow key={invoice.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {invoice.filename || "-"}
          </div>
        </TableCell>
        <TableCell>
          {invoice.invoice_date 
            ? formatDate(invoice.invoice_date)
            : formatDate(invoice.created_at || "")}
        </TableCell>
        <TableCell>
          {formatInvoiceNumber(invoice as any)}
        </TableCell>
        <TableCell>
          <InvoiceTypeBadge invoiceType={invoice.invoice_type} />
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span>{invoice.issuer_name || "-"}</span>
            <span className="text-xs text-muted-foreground">{invoice.issuer_rfc}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span>{invoice.receiver_name || "-"}</span>
            <span className="text-xs text-muted-foreground">{invoice.receiver_rfc}</span>
          </div>
        </TableCell>
        <TableCell className={`text-right ${invoice.invoice_type === 'E' ? 'text-red-600 font-medium' : ''}`}>
          {formatInvoiceAmount(invoice as any)}
        </TableCell>
        <TableCell className={`text-right ${invoice.invoice_type === 'E' ? 'text-red-600 font-medium' : ''}`}>
          {formatInvoiceTaxAmount(invoice as any)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {getStatusIcon(invoice.status)}
            <span>{invoice.status === 'completed' ? 'Completado' : 
                   invoice.status === 'error' ? 'Error' : 
                   invoice.status}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {getReconciliationBadge(invoice.is_reconciled, invoice.reconciliation_type)}
            {(canMarkManually || canUnmarkManually) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canMarkManually && (
                    <DropdownMenuItem
                      onClick={() => setShowReconciliationDialog(true)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como reconciliada
                    </DropdownMenuItem>
                  )}
                  {canUnmarkManually && (
                    <DropdownMenuItem
                      onClick={handleUnmarkAsReconciled}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Desmarcar reconciliación
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>

      <ManualReconciliationDialog
        open={showReconciliationDialog}
        onOpenChange={setShowReconciliationDialog}
        invoice={invoice}
        onConfirm={handleMarkAsReconciled}
        isLoading={isLoading}
      />
    </>
  );
};
