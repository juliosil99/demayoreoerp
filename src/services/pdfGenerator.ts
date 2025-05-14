
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";

interface PdfGenerationResult {
  success: boolean;
  error?: string;
}

export const generateInvoicePdf = async (
  invoiceId: number,
  issuerRfc: string
): Promise<PdfGenerationResult> => {
  try {
    console.log(`Generating PDF for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);

    // 1. Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError);
      throw new Error("No se encontró la factura");
    }

    console.log("Invoice data fetched successfully:", invoice.invoice_number);

    // 2. Get invoice products
    const { data: products, error: productsError } = await supabase
      .from("invoice_products")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      throw new Error("Error al obtener los productos de la factura");
    }

    console.log(`Fetched ${products.length} products for invoice`);

    // 3. Get PDF template configuration
    const { data: templateConfig, error: templateError } = await supabase
      .from("issuer_pdf_configs")
      .select("*")
      .eq("issuer_rfc", issuerRfc)
      .single();

    if (templateError) {
      console.log("No custom template found for RFC, using default template");
    } else {
      console.log("Using custom template for RFC:", issuerRfc);
    }
    
    // 4. Generate PDF
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("FACTURA", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Adding issuer and receiver information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EMISOR", 14, 30);
    doc.setFont("helvetica", "normal");
    doc.text(`${invoice.issuer_name || "N/A"}`, 14, 36);
    doc.text(`RFC: ${invoice.issuer_rfc || "N/A"}`, 14, 42);
    
    if (templateConfig) {
      if (templateConfig.address) doc.text(`${templateConfig.address}`, 14, 48);
      if (templateConfig.phone) doc.text(`Tel: ${templateConfig.phone}`, 14, 54);
      if (templateConfig.email) doc.text(`Email: ${templateConfig.email}`, 14, 60);
      if (templateConfig.website) doc.text(`Web: ${templateConfig.website}`, 14, 66);
    }
    
    // Receiver information
    doc.setFont("helvetica", "bold");
    doc.text("RECEPTOR", 14, 78);
    doc.setFont("helvetica", "normal");
    doc.text(`${invoice.receiver_name || "N/A"}`, 14, 84);
    doc.text(`RFC: ${invoice.receiver_rfc || "N/A"}`, 14, 90);
    
    // Invoice details
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA FACTURA", 120, 30);
    doc.setFont("helvetica", "normal");
    doc.text(`Serie-Folio: ${invoice.serie || ""} ${invoice.invoice_number || "N/A"}`, 120, 36);
    doc.text(`Fecha: ${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "N/A"}`, 120, 42);
    doc.text(`UUID: ${invoice.uuid || "N/A"}`, 120, 48);
    doc.text(`Total: ${formatCurrency(invoice.total_amount || 0)}`, 120, 54);
    
    // Add products table
    const tableColumn = ["Cantidad", "Descripción", "Valor Unitario", "Importe"];
    const tableRows = products.map(product => [
      product.quantity?.toString() || "1",
      product.description || "N/A",
      formatCurrency(product.unit_value || 0),
      formatCurrency(product.amount || 0)
    ]);
    
    autoTable(doc, {
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 130, finalY);
    doc.text("IVA:", 130, finalY + 6);
    doc.text("Total:", 130, finalY + 12);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${formatCurrency(invoice.subtotal || 0)}`, 170, finalY, { align: "right" });
    doc.text(`${formatCurrency(invoice.tax_amount || 0)}`, 170, finalY + 6, { align: "right" });
    doc.text(`${formatCurrency(invoice.total_amount || 0)}`, 170, finalY + 12, { align: "right" });
    
    // Footer with additional information
    const footerText = "Este documento es una representación impresa de un CFDI";
    const textWidth = doc.getTextWidth(footerText);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(footerText, pageWidth / 2 - textWidth / 2, doc.internal.pageSize.getHeight() - 10);
    
    console.log("PDF generation completed, saving file...");
    
    // Save PDF with a clear filename
    const filename = `Factura-${invoice.serie || ""}-${invoice.invoice_number || invoice.id}.pdf`;
    doc.save(filename);
    console.log("PDF saved successfully:", filename);
    
    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido generando PDF",
    };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};
