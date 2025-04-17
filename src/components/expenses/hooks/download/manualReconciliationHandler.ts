
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processDownloadQueue } from "./downloadQueueProcessor";
import type { DownloadItem, Expense } from "./types";

export const handleManualReconciliation = async (
  expense: Expense, 
  onLog: (message: string) => void,
  onProgressUpdate: (current: number, total: number) => void
): Promise<boolean> => {
  onLog('Processing as manual reconciliation');
  
  // First, get the manual reconciliation record to get file_id
  const { data: manualRec, error: manualRecError } = await supabase
    .from('manual_reconciliations')
    .select('file_id, reconciliation_type')
    .eq('expense_id', expense.id)
    .single();
    
  if (manualRecError) {
    onLog(`Error fetching manual reconciliation: ${manualRecError.message}`);
    toast.error("Error al buscar información de conciliación manual");
    return false;
  }
    
  onLog(`Manual reconciliation record found: ${JSON.stringify(manualRec)}`);
  
  // Only proceed if we have a file_id
  if (manualRec?.file_id) {
    onLog(`Found file_id: ${manualRec.file_id}`);
    
    // Fetch the file details
    const { data: fileData, error: fileError } = await supabase
      .from('manual_invoice_files')
      .select('file_path, filename, content_type, size')
      .eq('id', manualRec.file_id)
      .single();
      
    if (fileError) {
      onLog(`Error fetching file data: ${fileError.message}`);
      toast.error("Error al buscar el archivo de factura manual");
      return false;
    }
      
    if (fileData) {
      onLog(`File data found: ${JSON.stringify(fileData)}`);
      
      const downloadQueue: DownloadItem[] = [{
        filePath: fileData.file_path,
        fileName: fileData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
        contentType: fileData.content_type,
        index: 1,
        total: 1
      }];
      
      const success = await processDownloadQueue(downloadQueue, onLog, onProgressUpdate);
      if (success) {
        toast.success("Archivo descargado correctamente");
        return true;
      }
    } else {
      onLog('No file data found');
      toast.error("No se encontró el archivo asociado a esta conciliación manual");
    }
  } else {
    onLog('No file_id found in manual reconciliation record');
    toast.info("Este gasto fue conciliado manualmente sin adjuntar un archivo");
  }
  
  return false;
};
