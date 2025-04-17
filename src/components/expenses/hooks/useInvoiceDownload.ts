
import { useState } from "react";
import { toast } from "sonner";
import { handleManualReconciliation } from "./download/manualReconciliationHandler";
import { handleInvoiceRelations } from "./download/invoiceRelationsHandler";
import type { DownloadProgress, Expense } from "./download/types";

export function useInvoiceDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadLog, setDownloadLog] = useState<string[]>([]);
  const [progress, setProgress] = useState<DownloadProgress>({ current: 0, total: 0 });
  
  const logAction = (message: string) => {
    console.log(`[useInvoiceDownload] ${message}`);
    setDownloadLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const updateProgress = (current: number, total: number) => {
    setProgress({ current, total });
  };

  const handleDownloadInvoice = async (expense: Expense) => {
    setIsDownloading(true);
    setDownloadLog([]);
    
    try {
      logAction(`Starting download process for expense ID: ${expense.id}`);
      logAction(`Expense reconciliation type: ${expense.reconciliation_type || 'Not set'}`);
      logAction(`Expense has invoice relations: ${Boolean(expense.expense_invoice_relations?.length)}`);
      if (expense.expense_invoice_relations?.length) {
        logAction(`Number of relations: ${expense.expense_invoice_relations.length}`);
        expense.expense_invoice_relations.forEach((rel, i) => {
          logAction(`Relation ${i+1}: File path: ${rel.invoice.file_path}, Filename: ${rel.invoice.filename}, Invoice number: ${rel.invoice.invoice_number}`);
        });
      }
      
      // Case 1: Manual reconciliation - check for manual_reconciliations table
      if (expense.reconciliation_type === 'manual') {
        await handleManualReconciliation(expense, logAction, updateProgress);
        return;
      }
      
      // Case 2: Regular invoice reconciliation through expense_invoice_relations
      await handleInvoiceRelations(expense, logAction, updateProgress);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logAction(`General error: ${errorMessage}`);
      console.error("Error downloading invoice:", error);
      toast.error("Error al descargar la factura");
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
      
      // Log the complete download process
      logAction("Download attempt completed");
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
