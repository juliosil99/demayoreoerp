
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

export function useInvoiceDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadLog, setDownloadLog] = useState<string[]>([]);

  const logAction = (message: string) => {
    console.log(message);
    setDownloadLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
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
            
            try {
              const filePath = fileData.file_path;
              logAction(`File path: ${filePath}`);
              
              // Attempt to download the file
              await downloadInvoiceFile(
                filePath,
                fileData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
                fileData.content_type
              );
              toast.success("Archivo descargado correctamente");
            } catch (downloadError) {
              const errorMessage = downloadError instanceof Error ? downloadError.message : String(downloadError);
              logAction(`Download error: ${errorMessage}`);
              console.error("Download error:", downloadError);
              toast.error("Error al descargar el archivo");
            }
            return;
          } else {
            logAction('No file data found');
            toast.error("No se encontró el archivo asociado a esta conciliación manual");
            return;
          }
        } else {
          logAction('No file_id found in manual reconciliation record');
          toast.info("Este gasto fue conciliado manualmente sin adjuntar un archivo");
          return;
        }
      }
      
      // Case 2: Regular invoice reconciliation through expense_invoice_relations
      if (expense.expense_invoice_relations?.length) {
        logAction('Processing as regular invoice reconciliation');
        logAction(`Found ${expense.expense_invoice_relations.length} invoice relations`);
        
        // Check if there are multiple invoices
        const invoiceCount = expense.expense_invoice_relations.length;
        
        if (invoiceCount > 1) {
          logAction(`Multiple invoices found (${invoiceCount}), downloading all`);
          toast.info(`Descargando ${invoiceCount} facturas asociadas a este gasto...`);
        }
        
        // Process all invoice relations (not just the first one)
        for (let i = 0; i < expense.expense_invoice_relations.length; i++) {
          const invoiceRelation = expense.expense_invoice_relations[i];
          logAction(`Processing invoice relation ${i+1}/${invoiceCount}: ${JSON.stringify(invoiceRelation.invoice)}`);
          
          if (!invoiceRelation.invoice.file_path) {
            logAction(`No file path found for invoice relation ${i+1}`);
            continue; // Skip this invoice but continue with others
          }
          
          const fileName = invoiceRelation.invoice.invoice_number || 
                          invoiceRelation.invoice.uuid ||
                          `factura-${new Date().toISOString().split('T')[0]}-${i+1}`;
          
          logAction(`Using filename for invoice ${i+1}: ${fileName}`);
          logAction(`File path for invoice ${i+1}: ${invoiceRelation.invoice.file_path}`);
          
          try {
            await downloadInvoiceFile(
              invoiceRelation.invoice.file_path,
              fileName,
              invoiceRelation.invoice.content_type
            );
            
            // Don't show multiple toasts for batch downloads
            if (invoiceCount === 1) {
              toast.success("Factura descargada correctamente");
            }
          } catch (downloadError) {
            const errorMessage = downloadError instanceof Error ? downloadError.message : String(downloadError);
            logAction(`Download error for invoice ${i+1}: ${errorMessage}`);
            console.error(`Download error for invoice ${i+1}:`, downloadError);
            
            // Show individual error toast only for single invoice downloads
            if (invoiceCount === 1) {
              toast.error("Error al descargar el archivo");
            }
          }
        }
        
        // Show a completion toast only for multiple invoice downloads
        if (invoiceCount > 1) {
          toast.success(`Se completó la descarga de ${invoiceCount} facturas`);
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
      
      // Log the complete download process
      console.log("Download attempt log:", downloadLog);
    }
  };

  return {
    isDownloading,
    handleDownloadInvoice,
    downloadLog
  };
}
