
import { supabase } from "@/integrations/supabase/client";
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { generateInvoicePdf } from "@/services/invoicePdfService";
import { processDownloadQueue } from "./downloadQueueProcessor";
import type { Expense, LogAction, ProgressUpdater } from "./types";

export const handleInvoiceRelations = async (
  expense: Expense, 
  logAction: LogAction, 
  updateProgress: ProgressUpdater,
  format: 'xml' | 'pdf' = 'xml'
) => {
  if (!expense.expense_invoice_relations?.length) {
    logAction("No invoice relations found");
    return;
  }

  logAction(`Found ${expense.expense_invoice_relations.length} invoice relations`);
  logAction(`Download format: ${format.toUpperCase()}`);
  
  const downloadTasks = expense.expense_invoice_relations.map((relation, index) => ({
    id: `invoice-${relation.invoice.uuid || index}`,
    task: async () => {
      const invoice = relation.invoice;
      logAction(`Processing invoice ${index + 1}/${expense.expense_invoice_relations!.length}`);
      logAction(`Invoice UUID: ${invoice.uuid}`);
      logAction(`Invoice file path: ${invoice.file_path}`);
      logAction(`Invoice filename: ${invoice.filename}`);
      
      if (format === 'pdf') {
        // Generate PDF using the unified service
        logAction(`Generating PDF for invoice ID: ${invoice.uuid}`);
        
        // First, get the invoice ID from the database using UUID
        const { data: invoiceData, error } = await supabase
          .from('invoices')
          .select('id, issuer_rfc')
          .eq('uuid', invoice.uuid)
          .maybeSingle();
          
        if (error || !invoiceData) {
          logAction(`Error finding invoice in database: ${error?.message || 'Invoice not found'}`);
          throw new Error(`No se pudo encontrar la factura en la base de datos`);
        }
        
        logAction(`Found invoice ID: ${invoiceData.id}, RFC: ${invoiceData.issuer_rfc}`);
        
        const result = await generateInvoicePdf(invoiceData.id, invoiceData.issuer_rfc || '');
        
        if (!result.success) {
          logAction(`PDF generation failed: ${result.error}`);
          throw new Error(result.error || 'Error generating PDF');
        }
        
        logAction(`PDF generated successfully: ${result.filename}`);
      } else {
        // Download XML (existing functionality)
        logAction(`Downloading XML file: ${invoice.file_path}`);
        const success = await downloadInvoiceFile(
          invoice.file_path, 
          invoice.filename || `invoice-${invoice.uuid}`,
          invoice.content_type
        );
        
        if (!success) {
          logAction(`XML download failed for file: ${invoice.file_path}`);
          throw new Error(`Failed to download XML file: ${invoice.filename}`);
        }
        
        logAction(`XML download completed successfully`);
      }
    }
  }));

  await processDownloadQueue(downloadTasks, logAction, updateProgress);
  logAction(`All ${format.toUpperCase()} downloads completed`);
};
