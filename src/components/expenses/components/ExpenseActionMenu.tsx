import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Download, Bug, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvoiceDownload } from "../hooks/useInvoiceDownload";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Expense } from "../hooks/download/types";

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
  const { isDownloading, handleDownloadInvoice, downloadLog, progress } = useInvoiceDownload();
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  
  const hasInvoice = !!expense.reconciled && 
                     (!!expense.expense_invoice_relations?.length || 
                      expense.reconciliation_type === 'manual');
  
  const invoiceCount = expense.expense_invoice_relations?.length || 0;
                      
  const handleDownload = async () => {
    console.log(`[ExpenseActionMenu] Initiating download for expense ID: ${expense.id}`);
    console.log(`[ExpenseActionMenu] Invoice count: ${invoiceCount}`);
    if (expense.expense_invoice_relations) {
      console.log(`[ExpenseActionMenu] Invoice relations details:`, 
        expense.expense_invoice_relations.map(rel => ({
          uuid: rel.invoice.uuid,
          number: rel.invoice.invoice_number,
          path: rel.invoice.file_path
        }))
      );
    }
    
    await handleDownloadInvoice(expense);
  };

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

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
              {isDownloading ? "Descargando..." : invoiceCount > 1 
                ? `Descargar ${invoiceCount} Facturas` 
                : "Descargar Factura"}
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
            {isDownloading && progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Descargando archivos</span>
                  <span>{progress.current} de {progress.total}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Información del Gasto</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {JSON.stringify({
                  id: expense.id,
                  description: expense.description,
                  reconciled: expense.reconciled,
                  reconciliation_type: expense.reconciliation_type,
                  has_invoice_relations: !!expense.expense_invoice_relations?.length,
                  invoice_relations_count: expense.expense_invoice_relations?.length || 0,
                  invoice_relations: expense.expense_invoice_relations?.map(rel => ({
                    uuid: rel.invoice.uuid,
                    invoice_number: rel.invoice.invoice_number,
                    file_path: rel.invoice.file_path,
                    filename: rel.invoice.filename,
                  }))
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
            
            {invoiceCount > 1 && (
              <Alert>
                <AlertDescription>
                  Este gasto tiene {invoiceCount} facturas asociadas. Al hacer clic en "Descargar Facturas", 
                  se descargarán todas secuencialmente con un retraso de 3 segundos entre cada una para evitar conflictos.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Problema Común: Archivo No Encontrado</h3>
              <div className="text-sm space-y-2">
                <p>Si ve el mensaje <strong>"File not found in storage bucket"</strong>, significa que:</p>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                  <li>El registro del archivo existe en la base de datos</li>
                  <li>Pero el archivo físico no se encuentra en el bucket de almacenamiento</li>
                </ol>
                <div className="flex items-center p-2 bg-amber-50 border border-amber-200 rounded mt-2">
                  <FileX className="text-amber-500 mr-2 h-5 w-5" />
                  <p className="text-amber-700">Es posible que el archivo haya sido eliminado del bucket o que nunca se haya subido correctamente.</p>
                </div>
              </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Estado de la Descarga</h3>
              <div className="text-sm">
                <p><strong>Procesamiento:</strong> {isDownloading ? "Descargando..." : "Inactivo"}</p>
                <p><strong>Progreso:</strong> {progress.current}/{progress.total} ({progressPercentage}%)</p>
                <p><strong>Tiempo de espera entre descargas:</strong> 3 segundos</p>
                <p><strong>Tiempo de limpieza:</strong> 5 segundos</p>
              </div>
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
