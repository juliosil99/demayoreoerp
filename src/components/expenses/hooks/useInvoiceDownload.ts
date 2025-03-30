
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
              logAction(`File path: ${fileData.file_path}`);
              
              // Check if file exists in the bucket
              const { data: fileList, error: fileListError } = await supabase.storage
                .from('invoices')
                .list(fileData.file_path.split('/').slice(0, -1).join('/'), {
                  search: fileData.file_path.split('/').pop() || ''
                });
                
              if (fileListError) {
                logAction(`Error checking file existence: ${fileListError.message}`);
                toast.error(`Error verificando archivo: ${fileListError.message}`);
                return;
              }
              
              logAction(`File list result: ${JSON.stringify(fileList)}`);
              
              if (!fileList || fileList.length === 0) {
                logAction('File not found in storage bucket');
                toast.error("El archivo no se encontró en el almacenamiento");
                return;
              }
              
              logAction('Proceeding with download');
              await downloadInvoiceFile(
                fileData.file_path,
                fileData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
                fileData.content_type
              );
              toast.success("Archivo descargado correctamente");
            } catch (downloadError) {
              const errorMessage = downloadError instanceof Error ? downloadError.message : String(downloadError);
              logAction(`Download error: ${errorMessage}`);
              console.error("Download error:", downloadError);
              toast.error("Error al descargar el archivo");
              
              // Show detailed error in console
              console.log("Download log:", downloadLog);
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
        const invoiceRelation = expense.expense_invoice_relations[0];
        logAction(`Invoice relation: ${JSON.stringify(invoiceRelation.invoice)}`);
        
        if (!invoiceRelation.invoice.file_path) {
          logAction('No file path found in invoice relation');
          toast.error("No se encontró la ruta del archivo de factura");
          return;
        }
        
        const fileName = invoiceRelation.invoice.invoice_number || 
                         invoiceRelation.invoice.uuid ||
                         `factura-${new Date().toISOString().split('T')[0]}`;
        
        logAction(`Using filename: ${fileName}`);
        logAction(`File path: ${invoiceRelation.invoice.file_path}`);
        
        try {
          // Check if file exists in the bucket
          const { data: fileList, error: fileListError } = await supabase.storage
            .from('invoices')
            .list(invoiceRelation.invoice.file_path.split('/').slice(0, -1).join('/'), {
              search: invoiceRelation.invoice.file_path.split('/').pop() || ''
            });
            
          if (fileListError) {
            logAction(`Error checking file existence: ${fileListError.message}`);
            toast.error(`Error verificando archivo: ${fileListError.message}`);
            return;
          }
          
          logAction(`File list result: ${JSON.stringify(fileList)}`);
          
          if (!fileList || fileList.length === 0) {
            logAction('File not found in storage bucket');
            toast.error("El archivo no se encontró en el almacenamiento");
            return;
          }
          
          logAction('Proceeding with download');
          await downloadInvoiceFile(
            invoiceRelation.invoice.file_path,
            fileName,
            invoiceRelation.invoice.content_type
          );
          
          toast.success("Factura descargada correctamente");
        } catch (downloadError) {
          const errorMessage = downloadError instanceof Error ? downloadError.message : String(downloadError);
          logAction(`Download error: ${errorMessage}`);
          console.error("Download error:", downloadError);
          toast.error("Error al descargar el archivo");
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
