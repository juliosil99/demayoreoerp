
import { toast } from "sonner";
import { processDownloadQueue } from "./downloadQueueProcessor";
import type { DownloadItem, Expense } from "./types";

export const handleInvoiceRelations = async (
  expense: Expense,
  onLog: (message: string) => void,
  onProgressUpdate: (current: number, total: number) => void
): Promise<boolean> => {
  onLog('Processing as regular invoice reconciliation');
  
  if (!expense.expense_invoice_relations?.length) {
    onLog('No invoice relations found');
    toast.error("No hay facturas asociadas a este gasto");
    return false;
  }
  
  const invoiceCount = expense.expense_invoice_relations.length;
  onLog(`Found ${invoiceCount} invoice relations`);
  
  if (invoiceCount > 1) {
    onLog(`Multiple invoices found (${invoiceCount}), preparing download queue`);
    toast.info(`Preparando descarga de ${invoiceCount} facturas...`);
  }
  
  // Build the download queue
  const downloadQueue: DownloadItem[] = [];
  
  for (let i = 0; i < expense.expense_invoice_relations.length; i++) {
    const relation = expense.expense_invoice_relations[i];
    
    if (!relation.invoice.file_path) {
      onLog(`Skipping invoice relation ${i+1} - no file path`);
      continue;
    }
    
    const fileName = relation.invoice.invoice_number || 
                    relation.invoice.uuid ||
                    `factura-${new Date().toISOString().split('T')[0]}-${i+1}`;
    
    downloadQueue.push({
      filePath: relation.invoice.file_path,
      fileName,
      contentType: relation.invoice.content_type,
      index: i + 1,
      total: invoiceCount
    });
    
    onLog(`Added to queue: ${fileName} (${relation.invoice.file_path})`);
  }
  
  if (downloadQueue.length === 0) {
    onLog('No valid files to download');
    toast.error("No hay archivos válidos para descargar");
    return false;
  }
  
  // Process the queue
  onLog(`Starting to process download queue with ${downloadQueue.length} items`);
  const success = await processDownloadQueue(downloadQueue, onLog, onProgressUpdate);
  onLog(`Queue processing completed with success: ${success}`);
  
  // Show completion message
  if (downloadQueue.length > 1) {
    if (success) {
      toast.success(`Se completó la descarga de ${downloadQueue.length} facturas`);
    } else {
      toast.warning(`Descarga completada con algunos errores. Revise el log para más detalles.`);
    }
  }
  
  return success;
};
