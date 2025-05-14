
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
    console.log(`Starting PDF generation for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);

    // 1. Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError);
      return {
        success: false,
        error: "No se pudo encontrar la factura en la base de datos"
      };
    }

    console.log("Invoice data fetched:", {
      id: invoice.id,
      hasNumber: !!invoice.invoice_number,
      hasSerie: !!invoice.serie,
      hasDate: !!invoice.invoice_date,
      hasIssuerName: !!invoice.issuer_name,
      hasIssuerRfc: !!invoice.issuer_rfc,
      hasReceiverName: !!invoice.receiver_name,
      hasUuid: !!invoice.uuid
    });

    // 2. Get invoice products
    const { data: products, error: productsError } = await supabase
      .from("invoice_products")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return {
        success: false,
        error: "Error al obtener los productos de la factura"
      };
    }

    console.log(`Fetched ${products?.length || 0} products for invoice`);

    // 3. Try to get PDF template configuration, but don't fail if not found
    let templateConfig = null;
    try {
      const { data: config, error: templateError } = await supabase
        .from("issuer_pdf_configs")
        .select("*")
        .eq("issuer_rfc", issuerRfc)
        .maybeSingle();
      
      if (!templateError && config) {
        console.log("Found custom template for RFC:", issuerRfc);
        templateConfig = config;
      } else {
        console.log("No custom template found for RFC, using default template");
      }
    } catch (error) {
      console.log("Error fetching template, continuing with default:", error);
    }
    
    // 4. Generate PDF with robust fallbacks for missing data
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("FACTURA", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Adding issuer and receiver information with improved fallbacks
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EMISOR", 14, 30);
    doc.setFont("helvetica", "normal");
    
    // Improved fallbacks for issuer info
    const issuerName = invoice.issuer_name || "No disponible";
    const issuerRfcDisplay = invoice.issuer_rfc || "No disponible";
    
    doc.text(`${issuerName}`, 14, 36);
    doc.text(`RFC: ${issuerRfcDisplay}`, 14, 42);
    
    let yPosition = 48;
    
    // Add template info if available
    if (templateConfig) {
      if (templateConfig.address) {
        doc.text(`${templateConfig.address}`, 14, yPosition);
        yPosition += 6;
      }
      if (templateConfig.phone) {
        doc.text(`Tel: ${templateConfig.phone}`, 14, yPosition);
        yPosition += 6;
      }
      if (templateConfig.email) {
        doc.text(`Email: ${templateConfig.email}`, 14, yPosition);
        yPosition += 6;
      }
      if (templateConfig.website) {
        doc.text(`Web: ${templateConfig.website}`, 14, yPosition);
        yPosition += 6;
      }
    }
    
    // Receiver information with robust fallbacks
    yPosition = Math.max(yPosition, 78); // Ensure minimum spacing
    doc.setFont("helvetica", "bold");
    doc.text("RECEPTOR", 14, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`${invoice.receiver_name || "No disponible"}`, 14, yPosition + 6);
    doc.text(`RFC: ${invoice.receiver_rfc || "No disponible"}`, 14, yPosition + 12);
    
    // Invoice details with comprehensive fallbacks
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA FACTURA", 120, 30);
    doc.setFont("helvetica", "normal");
    
    // Use fallbacks for potentially missing fields with clear identification
    let invoiceNumber;
    if (invoice.serie && invoice.invoice_number) {
      invoiceNumber = `${invoice.serie} ${invoice.invoice_number}`;
    } else if (invoice.serie) {
      invoiceNumber = `${invoice.serie} (Sin número)`;
    } else if (invoice.invoice_number) {
      invoiceNumber = invoice.invoice_number;
    } else if (invoice.uuid) {
      invoiceNumber = `UUID: ${invoice.uuid.substring(0, 8)}...`;
    } else {
      invoiceNumber = "No disponible";
    }
      
    let invoiceDate;
    if (invoice.invoice_date) {
      invoiceDate = new Date(invoice.invoice_date).toLocaleDateString();
    } else if (invoice.stamp_date) {
      invoiceDate = new Date(invoice.stamp_date).toLocaleDateString() + " (Fecha timbrado)";
    } else {
      invoiceDate = "No disponible";
    }
      
    doc.text(`Serie-Folio: ${invoiceNumber}`, 120, 36);
    doc.text(`Fecha: ${invoiceDate}`, 120, 42);
    doc.text(`UUID: ${invoice.uuid ? invoice.uuid : "No disponible"}`, 120, 48);
    doc.text(`Total: ${formatCurrency(invoice.total_amount || 0)}`, 120, 54);
    
    // Add products table with better handling of empty/null values
    const tableColumn = ["Cantidad", "Descripción", "Valor Unitario", "Importe"];
    const tableRows = products && products.length > 0 
      ? products.map(product => [
          product.quantity?.toString() || "1",
          product.description || "Sin descripción",
          formatCurrency(product.unit_value || 0),
          formatCurrency(product.amount || 0)
        ])
      : [["--", "No se encontraron productos", "--", "--"]];
    
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
    
    // Footer with additional information and invoice identifier
    doc.setFontSize(10);
    doc.setTextColor(100);
    const footerText = "Este documento es una representación impresa de un CFDI";
    const textWidth = doc.getTextWidth(footerText);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(footerText, pageWidth / 2 - textWidth / 2, doc.internal.pageSize.getHeight() - 15);
    
    // Add UUID as reference in the footer if available
    if (invoice.uuid) {
      doc.setFontSize(8);
      doc.text(`UUID: ${invoice.uuid}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }
    
    console.log("PDF generation completed, saving file...");
    
    // Create a more robust filename with available data
    let filename;
    if (invoice.invoice_number && invoice.serie) {
      filename = `Factura-${invoice.serie}-${invoice.invoice_number}.pdf`;
    } else if (invoice.invoice_number) {
      filename = `Factura-${invoice.invoice_number}.pdf`;
    } else if (invoice.uuid) {
      filename = `Factura-UUID-${invoice.uuid.substring(0, 8)}.pdf`;
    } else if (invoice.issuer_name) {
      filename = `Factura-${invoice.issuer_name.replace(/\s+/g, '-')}-${invoiceId}.pdf`;
    } else {
      filename = `Factura-ID-${invoiceId}.pdf`;
    }
    
    doc.save(filename);
    console.log("PDF saved successfully with filename:", filename);
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in PDF generation:", error);
    return {
      success: false,
      error: error instanceof Error 
        ? `Error al generar PDF: ${error.message}` 
        : "Error desconocido al generar el PDF",
    };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};
