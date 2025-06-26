
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { toast } from "sonner";

interface BatchItem {
  id: string;
  item_type: string;
  item_id: string;
  amount: number;
  description: string | null;
}

interface ReconciliationBatch {
  id: string;
  batch_number: string;
  description: string | null;
  total_amount: number;
  status: 'active' | 'cancelled';
  created_at: string;
  notes: string | null;
}

export const generateReconciliationBatchPdf = async (batchId: string): Promise<boolean> => {
  try {
    console.log('Generating PDF for batch:', batchId);

    // Fetch batch data
    const { data: batch, error: batchError } = await supabase
      .from('reconciliation_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.error('Error fetching batch:', batchError);
      toast.error('No se pudo encontrar el lote');
      return false;
    }

    // Fetch batch items
    const { data: batchItems, error: itemsError } = await supabase
      .from('reconciliation_batch_items')
      .select('*')
      .eq('batch_id', batchId);

    if (itemsError) {
      console.error('Error fetching batch items:', itemsError);
      toast.error('Error al obtener los elementos del lote');
      return false;
    }

    // Fetch expense details
    const expenseIds = batchItems
      ?.filter(item => item.item_type === 'expense')
      .map(item => item.item_id) || [];

    let expenseDetails = [];
    if (expenseIds.length > 0) {
      const { data } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          date,
          contacts (name),
          bank_accounts (name)
        `)
        .in('id', expenseIds);
      expenseDetails = data || [];
    }

    // Fetch invoice details
    const invoiceIds = batchItems
      ?.filter(item => item.item_type === 'invoice')
      .map(item => parseInt(item.item_id)) || [];

    let invoiceDetails = [];
    if (invoiceIds.length > 0) {
      const { data } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          invoice_date,
          issuer_name
        `)
        .in('id', invoiceIds);
      invoiceDetails = data || [];
    }

    // Generate PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LOTE DE RECONCILIACIÓN", doc.internal.pageSize.getWidth() / 2, yPosition, { align: "center" });
    
    yPosition += 20;

    // Batch info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL LOTE", 14, yPosition);
    
    yPosition += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    doc.text(`Número de Lote: ${batch.batch_number}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Fecha de Creación: ${formatCardDate(batch.created_at)}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Estado: ${batch.status === 'active' ? 'Activo' : 'Cancelado'}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Total: ${formatCurrency(batch.total_amount)}`, 14, yPosition);
    
    if (batch.description) {
      yPosition += 6;
      doc.text(`Descripción: ${batch.description}`, 14, yPosition);
    }

    if (batch.notes) {
      yPosition += 6;
      doc.text(`Notas: ${batch.notes}`, 14, yPosition);
    }

    yPosition += 15;

    // Expenses section
    const expenses = batchItems?.filter(item => item.item_type === 'expense') || [];
    if (expenses.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("GASTOS INCLUIDOS", 14, yPosition);
      yPosition += 10;

      const expenseRows = expenses.map(item => {
        const expenseDetail = expenseDetails.find(e => e.id === item.item_id);
        return [
          item.description || expenseDetail?.description || 'Sin descripción',
          expenseDetail?.contacts?.name || 'N/A',
          expenseDetail?.date ? formatCardDate(expenseDetail.date) : 'N/A',
          formatCurrency(item.amount)
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Descripción', 'Proveedor', 'Fecha', 'Importe']],
        body: expenseRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255,
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        }
      });

      yPosition = (doc as any).lastAutoTable?.finalY + 15 || yPosition + 50;
    }

    // Invoices section
    const invoices = batchItems?.filter(item => item.item_type === 'invoice') || [];
    if (invoices.length > 0) {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("FACTURAS INCLUIDAS", 14, yPosition);
      yPosition += 10;

      const invoiceRows = invoices.map(item => {
        const invoiceDetail = invoiceDetails.find(inv => inv.id === parseInt(item.item_id));
        return [
          invoiceDetail?.invoice_number || 'Sin número',
          invoiceDetail?.issuer_name || 'N/A',
          invoiceDetail?.invoice_date ? formatCardDate(invoiceDetail.invoice_date) : 'N/A',
          formatCurrency(item.amount)
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Número', 'Emisor', 'Fecha', 'Importe']],
        body: invoiceRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255,
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        }
      });

      yPosition = (doc as any).lastAutoTable?.finalY + 15 || yPosition + 50;
    }

    // Adjustments section
    const adjustments = batchItems?.filter(item => item.item_type === 'adjustment') || [];
    if (adjustments.length > 0) {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("AJUSTES INCLUIDOS", 14, yPosition);
      yPosition += 10;

      const adjustmentRows = adjustments.map(item => [
        item.description || 'Ajuste',
        formatCurrency(item.amount)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Descripción', 'Importe']],
        body: adjustmentRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255,
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        }
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-MX')}`, pageWidth / 2, pageHeight - 20, { align: "center" });
    doc.text(`Lote: ${batch.batch_number}`, pageWidth / 2, pageHeight - 15, { align: "center" });

    // Save the PDF
    const filename = `Lote-Reconciliacion-${batch.batch_number}.pdf`;
    doc.save(filename);
    
    console.log('PDF generated successfully:', filename);
    toast.success('PDF descargado exitosamente');
    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Error al generar el PDF');
    return false;
  }
};
