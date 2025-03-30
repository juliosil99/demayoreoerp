
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

  const handleDownloadInvoice = async (expense: Expense) => {
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
          
        // Only proceed if we have a file_id
        if (manualRec?.file_id) {
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
            
            try {
              // Try to get file from storage to verify it exists before attempting download
              const { data: fileExists } = await supabase.storage
                .from('invoices')
                .getPublicUrl(fileData.file_path);
                
              if (!fileExists) {
                console.error("File existence check failed");
                toast.error("El archivo no se encontró en el almacenamiento");
                return;
              }
              
              await downloadInvoiceFile(
                fileData.file_path,
                fileData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
                fileData.content_type
              );
              toast.success("Archivo descargado correctamente");
            } catch (downloadError) {
              console.error("Download error:", downloadError);
              toast.error("Error al descargar el archivo");
            }
            return;
          } else {
            toast.error("No se encontró el archivo asociado a esta conciliación manual");
            return;
          }
        } else {
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
        
        try {
          // Verify file exists before attempting download
          const { data: fileExists } = await supabase.storage
            .from('invoices')
            .getPublicUrl(invoiceRelation.invoice.file_path);
            
          if (!fileExists) {
            console.error("File existence check failed");
            toast.error("El archivo no se encontró en el almacenamiento");
            return;
          }
          
          await downloadInvoiceFile(
            invoiceRelation.invoice.file_path,
            fileName,
            invoiceRelation.invoice.content_type
          );
          
          toast.success("Factura descargada correctamente");
        } catch (downloadError) {
          console.error("Download error:", downloadError);
          toast.error("Error al descargar el archivo");
        }
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

  return {
    isDownloading,
    handleDownloadInvoice
  };
}
