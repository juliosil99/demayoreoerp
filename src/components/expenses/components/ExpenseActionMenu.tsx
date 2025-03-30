
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Download, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
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
  const { isDownloading, handleDownloadInvoice, downloadLog } = useInvoiceDownload();
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  
  // Check if the expense is reconciled and needs download button
  const hasInvoice = !!expense.reconciled && 
                     (!!expense.expense_invoice_relations?.length || 
                      expense.reconciliation_type === 'manual');
                      
  const handleDownload = async () => {
    await handleDownloadInvoice(expense);
  };

  return (
    <>
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
              onClick={handleDownload}
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
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsDebugOpen(true)}>
            <Bug className="mr-2 h-4 w-4" />
            Ver logs de descarga
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isDebugOpen} onOpenChange={setIsDebugOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Información de Depuración (Debug)</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Información del Gasto</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {JSON.stringify({
                  id: expense.id,
                  description: expense.description,
                  reconciled: expense.reconciled,
                  reconciliation_type: expense.reconciliation_type,
                  has_invoice_relations: !!expense.expense_invoice_relations?.length,
                }, null, 2)}
              </pre>
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Log de Descarga</h3>
              <div className="text-xs bg-slate-100 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                {downloadLog.length > 0 ? (
                  downloadLog.map((log, i) => (
                    <div key={i} className="py-1 border-b border-slate-200 last:border-0">
                      {log}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No hay logs de descarga disponibles. Intente descargar primero.</p>
                )}
              </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Instrucciones de Depuración</h3>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Haga clic en "Descargar Factura" para intentar descargar el archivo.</li>
                <li>Revise los logs para identificar dónde ocurre el problema.</li>
                <li>Verifique que el archivo exista en el bucket de almacenamiento.</li>
                <li>Verifique que la ruta del archivo sea correcta.</li>
              </ol>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsDebugOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
