
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { toast } from "sonner";
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

type DownloadItem = {
  filePath: string;
  fileName: string;
  contentType?: string;
  index: number;
  total: number;
};

export function useInvoiceDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadLog, setDownloadLog] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const logAction = (message: string) => {
    console.log(message);
    setDownloadLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Queue to process downloads sequentially with delays
  const processDownloadQueue = async (items: DownloadItem[]): Promise<boolean> => {
    const total = items.length;
    setProgress({ current: 0, total });
    
    let allSuccessful = true;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const currentIndex = i + 1;
      
      logAction(`Processing download ${currentIndex}/${total}: ${item.fileName}`);
      setProgress({ current: currentIndex, total });
      
      // Show progress toast for multiple files
      if (total > 1) {
        toast.info(`Descargando archivo ${currentIndex} de ${total}...`, {
          id: "download-progress",
          duration: 2000,
        });
      }
      
      try {
        // Download the file
        const success = await downloadInvoiceFile(
          item.filePath,
          item.fileName,
          item.contentType
        );
        
        if (!success) {
          logAction(`Failed to download file ${currentIndex}/${total}`);
          allSuccessful = false;
        }
      } catch (error) {
        logAction(`Error downloading file ${currentIndex}/${total}: ${error instanceof Error ? error.message : String(error)}`);
        allSuccessful = false;
      }
      
      // Add delay between downloads (only if there are more files)
      if (i < items.length - 1) {
        logAction(`Adding delay between downloads (1 second)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return allSuccessful;
  };

  const handleDownloadInvoice = async (expense: Expense) => {
    setIsDownloading(true);
    setDownloadLog([]);
    
    try {
      logAction(`Starting download process for expense ID: ${expense.id}`);
      logAction(`Expense reconciliation type: ${expense.reconciliation_type || 'Not set'}`);
      logAction(`Expense has invoice relations: ${Boolean(expense.expense_invoice_relations?.length)}`);
      
      // Case 1: Manual reconciliation - check for manual_reconciliations table
      if (expense.reconciliation_type === 'manual') {
        logAction('Processing as manual reconciliation');
        
        // First, get the manual reconciliation record to get file_id
        const { data: manualRec, error: manualRecError } = await supabase
          .from('manual_reconciliations')
          .select('file_id, reconciliation_type')
          .eq('expense_id', expense.id)
          .single();
          
        if (manualRecError) {
          logAction(`Error fetching manual reconciliation: ${manualRecError.message}`);
          console.error("Error fetching manual reconciliation:", manualRecError);
          toast.error("Error al buscar información de conciliación manual");
          return;
        }
          
        logAction(`Manual reconciliation record found: ${JSON.stringify(manualRec)}`);
        
        // Only proceed if we have a file_id
        if (manualRec?.file_id) {
          logAction(`Found file_id: ${manualRec.file_id}`);
          
          // Fetch the file details
          const { data: fileData, error: fileError } = await supabase
            .from('manual_invoice_files')
            .select('file_path, filename, content_type, size')
            .eq('id', manualRec.file_id)
            .single();
            
          if (fileError) {
            logAction(`Error fetching file data: ${fileError.message}`);
            console.error("Error fetching file data:", fileError);
            toast.error("Error al buscar el archivo de factura manual");
            return;
          }
            
          if (fileData) {
            logAction(`File data found: ${JSON.stringify(fileData)}`);
            
            const downloadQueue: DownloadItem[] = [{
              filePath: fileData.file_path,
              fileName: fileData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
              contentType: fileData.content_type,
              index: 1,
              total: 1
            }];
            
            const success = await processDownloadQueue(downloadQueue);
            if (success) {
              toast.success("Archivo descargado correctamente");
            }
          } else {
            logAction('No file data found');
            toast.error("No se encontró el archivo asociado a esta conciliación manual");
          }
          return;
        } else {
          logAction('No file_id found in manual reconciliation record');
          toast.info("Este gasto fue conciliado manualmente sin adjuntar un archivo");
          return;
        }
      }
      
      // Case 2: Regular invoice reconciliation through expense_invoice_relations
      if (expense.expense_invoice_relations?.length) {
        logAction('Processing as regular invoice reconciliation');
        
        const invoiceCount = expense.expense_invoice_relations.length;
        logAction(`Found ${invoiceCount} invoice relations`);
        
        if (invoiceCount > 1) {
          logAction(`Multiple invoices found (${invoiceCount}), preparing download queue`);
          toast.info(`Preparando descarga de ${invoiceCount} facturas...`);
        }
        
        // Build the download queue
        const downloadQueue: DownloadItem[] = [];
        
        for (let i = 0; i < expense.expense_invoice_relations.length; i++) {
          const relation = expense.expense_invoice_relations[i];
          
          if (!relation.invoice.file_path) {
            logAction(`Skipping invoice relation ${i+1} - no file path`);
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
          
          logAction(`Added to queue: ${fileName} (${relation.invoice.file_path})`);
        }
        
        if (downloadQueue.length === 0) {
          logAction('No valid files to download');
          toast.error("No hay archivos válidos para descargar");
          return;
        }
        
        // Process the queue
        const success = await processDownloadQueue(downloadQueue);
        
        // Show completion message
        if (downloadQueue.length > 1) {
          if (success) {
            toast.success(`Se completó la descarga de ${downloadQueue.length} facturas`);
          } else {
            toast.warning(`Descarga completada con algunos errores. Revise el log para más detalles.`);
          }
        }
      } else {
        logAction('No invoice relations found');
        toast.error("No hay facturas asociadas a este gasto");
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logAction(`General error: ${errorMessage}`);
      console.error("Error downloading invoice:", error);
      toast.error("Error al descargar la factura");
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
      
      // Log the complete download process
      console.log("Download attempt log:", downloadLog);
    }
  };

  return {
    isDownloading,
    handleDownloadInvoice,
    downloadLog,
    progress
  };
}
