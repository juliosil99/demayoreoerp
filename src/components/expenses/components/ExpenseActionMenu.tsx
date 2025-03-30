
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoiceDownload } from "../hooks/useInvoiceDownload";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
};

interface ExpenseActionMenuProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseActionMenu({ expense, onEdit, onDelete }: ExpenseActionMenuProps) {
  const { isDownloading, handleDownloadInvoice } = useInvoiceDownload();
  
  // Check if the expense is reconciled and needs download button
  const hasInvoice = !!expense.reconciled && 
                     (!!expense.expense_invoice_relations?.length || 
                      expense.reconciliation_type === 'manual');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {hasInvoice && (
          <DropdownMenuItem 
            onClick={() => handleDownloadInvoice(expense)}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Descargando..." : "Descargar Factura"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
