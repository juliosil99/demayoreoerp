
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, FileDown, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { InvoiceTypeBadge } from "../InvoiceTypeBadge";
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { generateInvoicePdf } from "@/services/invoicePdfService";
import { useManualInvoiceReconciliation } from "@/hooks/invoices/useManualInvoiceReconciliation";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PartialInvoice = Partial<Database["public"]["Tables"]["invoices"]["Row"]> & {
  is_reconciled?: boolean;
  reconciliation_type?: 'automatic' | 'manual' | null;
};

interface OptimizedInvoiceRowProps {
  invoice: PartialInvoice;
}

export const OptimizedInvoiceRow = ({ invoice }: OptimizedInvoiceRowProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { markAsReconciled, unmarkAsReconciled } = useManualInvoiceReconciliation();

  const handleDownloadXml = async () => {
    if (!invoice.file_path || !invoice.filename) {
      toast.error("No se encontró el archivo XML para esta factura");
      return;
    }
    
    try {
      await downloadInvoiceFile(invoice.file_path, invoice.filename);
    } catch (error) {
      console.error("Error downloading XML:", error);
      toast.error("Error al descargar el archivo XML");
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice.id || !invoice.issuer_rfc) {
      toast.error("Información insuficiente para generar el PDF");
      return;
    }

    try {
      toast.info("Generando PDF...");
      const result = await generateInvoicePdf(invoice.id, invoice.issuer_rfc);
      
      if (result.success) {
        toast.success(`PDF generado: ${result.filename}`);
      } else {
        toast.error(result.error || "Error al generar el PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  const handleToggleReconciliation = async () => {
    if (!invoice.id) return;
    
    setIsProcessing(true);
    try {
      if (invoice.is_reconciled && invoice.reconciliation_type === 'manual') {
        await unmarkAsReconciled(invoice.id);
      } else if (!invoice.is_reconciled) {
        await markAsReconciled(invoice.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const reconciliationStatus = invoice.is_reconciled 
    ? (invoice.reconciliation_type === 'manual' ? 'Manual' : 'Automática')
    : 'No conciliada';

  const canToggleReconciliation = !invoice.is_reconciled || invoice.reconciliation_type === 'manual';

  return (
    <TableRow>
      <TableCell className="font-medium">
        {invoice.filename || "Sin archivo"}
      </TableCell>
      <TableCell>
        {invoice.invoice_date ? formatCardDate(invoice.invoice_date) : "N/A"}
      </TableCell>
      <TableCell>{invoice.invoice_number || "N/A"}</TableCell>
      <TableCell>{invoice.serie || "N/A"}</TableCell>
      <TableCell>
        <InvoiceTypeBadge invoiceType={invoice.invoice_type || ""} />
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {invoice.issuer_name || "N/A"}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {invoice.receiver_name || "N/A"}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(invoice.total_amount)}
      </TableCell>
      <TableCell>
        <span className={`text-xs px-2 py-1 rounded ${
          invoice.is_reconciled 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {reconciliationStatus}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadXml}
            className="h-8 w-8 p-0"
            title="Descargar XML"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPdf}
            className="h-8 w-8 p-0"
            title="Descargar PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          {canToggleReconciliation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleReconciliation}
              disabled={isProcessing}
              className="h-8 w-8 p-0"
              title={invoice.is_reconciled ? "Desmarcar como reconciliada" : "Marcar como reconciliada"}
            >
              {invoice.is_reconciled ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
