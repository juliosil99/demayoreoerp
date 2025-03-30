
import { MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types/base";
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface ExpenseActionsProps {
  expense: Expense;
  onDelete: () => Promise<void>;
  onEdit: (expense: Expense) => void;
  isDialogOpen: boolean;
  selectedExpense: Expense | null;
  handleCloseDialog: () => void;
}

export function ExpenseActions({
  expense,
  onDelete,
  onEdit,
  isDialogOpen,
  selectedExpense,
  handleCloseDialog
}: ExpenseActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleEditSuccess = () => {
    handleCloseDialog();
  };
  
  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      // Case 1: Manual reconciliation - check for manual_reconciliations table
      if (expense.reconciliation_type === 'manual') {
        // First, get the manual reconciliation record to get file_id
        const { data: manualRec, error: manualRecError } = await supabase
          .from('manual_reconciliations')
          .select('file_id, reconciliation_type')
          .eq('expense_id', expense.id)
          .single();
          
        if (manualRecError) {
          console.error("Error fetching manual reconciliation:", manualRecError);
          toast.error("Error al buscar información de conciliación manual");
          return;
        }
          
        // Only proceed if we have a file_id and reconciliation type is pdf_only
        if (manualRec?.file_id && manualRec.reconciliation_type === 'pdf_only') {
          // Fetch the file details
          const { data: fileData, error: fileError } = await supabase
            .from('manual_invoice_files')
            .select('file_path, filename, content_type')
            .eq('id', manualRec.file_id)
            .single();
            
          if (fileError) {
            console.error("Error fetching file data:", fileError);
            toast.error("Error al buscar el archivo de factura manual");
            return;
          }
            
          if (fileData) {
            console.log("Manual file found:", fileData);
            await downloadInvoiceFile(
              fileData.file_path,
              fileData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
              fileData.content_type
            );
            toast.success("Archivo descargado correctamente");
            return;
          } else {
            toast.error("No se encontró el archivo asociado a esta conciliación manual");
            return;
          }
        } else if (manualRec?.reconciliation_type !== 'pdf_only') {
          toast.info("Este gasto fue conciliado manualmente sin adjuntar un archivo");
          return;
        }
      }
      
      // Case 2: Regular invoice reconciliation through expense_invoice_relations
      if (expense.expense_invoice_relations?.length) {
        const invoiceRelation = expense.expense_invoice_relations[0];
        
        if (!invoiceRelation.invoice.file_path) {
          toast.error("No se encontró la ruta del archivo de factura");
          return;
        }
        
        const fileName = invoiceRelation.invoice.invoice_number || 
                         invoiceRelation.invoice.uuid ||
                         `factura-${new Date().toISOString().split('T')[0]}`;
        
        await downloadInvoiceFile(
          invoiceRelation.invoice.file_path,
          fileName,
          invoiceRelation.invoice.content_type
        );
        
        toast.success("Factura descargada correctamente");
      } else {
        toast.error("No hay facturas asociadas a este gasto");
      }
      
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Error al descargar la factura");
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if the expense is reconciled and needs download button
  const hasInvoice = !!expense.reconciled && 
                     (!!expense.expense_invoice_relations?.length || 
                      expense.reconciliation_type === 'manual');

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(expense)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {hasInvoice && (
            <DropdownMenuItem 
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Descargando..." : "Descargar Factura"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este gasto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={isDeleting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isDialogOpen && selectedExpense?.id === expense.id && (
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Gasto</DialogTitle>
            </DialogHeader>
            <ExpenseForm 
              initialData={selectedExpense} 
              onSuccess={handleEditSuccess} 
              onClose={handleCloseDialog} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
