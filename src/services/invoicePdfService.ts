
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";
import { 
  formatCurrency, 
  createPdfFilename,
  getInvoiceIdentifier,
  getFormattedDate,
  safeAddText
} from "@/utils/pdfGenerationUtils";

export interface PdfGenerationResult {
  success: boolean;
  error?: string;
  filename?: string;
}

interface InvoiceData {
  id: number;
  invoice_number?: string | null;
  serie?: string | null;
  invoice_date?: string | null;
  stamp_date?: string | null;
  issuer_name?: string | null;
  issuer_rfc?: string | null;
  receiver_name?: string | null;
  receiver_rfc?: string | null;
  uuid?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
}

interface ProductData {
  quantity?: number | null;
  description?: string | null;
  unit_value?: number | null;
  amount?: number | null;
  unit?: string | null;
}

interface PdfTemplate {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
}

/**
 * Fetches invoice data from the database
 */
const fetchInvoiceData = async (invoiceId: number): Promise<InvoiceData | null> => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invoice:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error("No invoice found with the provided ID");
    }

    console.log("Invoice data fetched successfully");
    return data;
  } catch (error) {
    console.error("Error in fetchInvoiceData:", error);
    throw error;
  }
};

/**
 * Fetches products for an invoice from the database
 */
const fetchInvoiceProducts = async (invoiceId: number): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from("invoice_products")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Fetched ${data?.length || 0} products for invoice`);
    return data || [];
  } catch (error) {
    console.error("Error in fetchInvoiceProducts:", error);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetches PDF template configuration for an issuer
 */
const fetchTemplateConfig = async (issuerRfc: string): Promise<PdfTemplate | null> => {
  try {
    if (!issuerRfc) {
      console.log("No issuer RFC provided, skipping template fetch");
      return null;
    }

    const { data, error } = await supabase
      .from("issuer_pdf_configs")
      .select("*")
      .eq("issuer_rfc", issuerRfc)
      .maybeSingle();
    
    if (!error && data) {
      console.log("Found custom template for RFC:", issuerRfc);
      return data;
    }
    
    console.log("No custom template found for RFC, using default template");
    return null;
  } catch (error) {
    console.log("Error fetching template, continuing with default:", error);
    return null;
  }
};

/**
 * Generates the PDF document for an invoice
 */
const generatePdfDocument = (
  invoice: InvoiceData, 
  products: ProductData[], 
  templateConfig: PdfTemplate | null
): jsPDF => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("FACTURA", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
  
  // Adding issuer information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("EMISOR", 14, 30);
  doc.setFont("helvetica", "normal");
  
  const issuerName = invoice.issuer_name || "No disponible";
  const issuerRfcDisplay = invoice.issuer_rfc || "No disponible";
  
  safeAddText(doc, issuerName, 14, 36);
  safeAddText(doc, `RFC: ${issuerRfcDisplay}`, 14, 42);
  
  let yPosition = 48;
  
  // Add template info if available
  if (templateConfig) {
    if (templateConfig.address) {
      safeAddText(doc, templateConfig.address, 14, yPosition);
      yPosition += 6;
    }
    if (templateConfig.phone) {
      safeAddText(doc, `Tel: ${templateConfig.phone}`, 14, yPosition);
      yPosition += 6;
    }
    if (templateConfig.email) {
      safeAddText(doc, `Email: ${templateConfig.email}`, 14, yPosition);
      yPosition += 6;
    }
    if (templateConfig.website) {
      safeAddText(doc, `Web: ${templateConfig.website}`, 14, yPosition);
      yPosition += 6;
    }
  }
  
  // Receiver information
  yPosition = Math.max(yPosition, 78); // Ensure minimum spacing
  doc.setFont("helvetica", "bold");
  doc.text("RECEPTOR", 14, yPosition);
  doc.setFont("helvetica", "normal");
  
  safeAddText(doc, invoice.receiver_name || "No disponible", 14, yPosition + 6);
  safeAddText(doc, `RFC: ${invoice.receiver_rfc || "No disponible"}`, 14, yPosition + 12);
  
  // Invoice details
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DE LA FACTURA", 120, 30);
  doc.setFont("helvetica", "normal");
  
  const invoiceNumber = getInvoiceIdentifier(invoice.serie, invoice.invoice_number, invoice.uuid);
  const invoiceDate = getFormattedDate(invoice.invoice_date, invoice.stamp_date);
    
  safeAddText(doc, `Serie-Folio: ${invoiceNumber}`, 120, 36);
  safeAddText(doc, `Fecha: ${invoiceDate}`, 120, 42);
  safeAddText(doc, `UUID: ${invoice.uuid ? invoice.uuid : "No disponible"}`, 120, 48);
  safeAddText(doc, `Total: ${formatCurrency(invoice.total_amount || 0)}`, 120, 54);
  
  // Products table
  try {
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
  } catch (tableError) {
    console.error("Error generating products table:", tableError);
    doc.text("Error al generar tabla de productos", 14, 100);
  }
  
  try {
    // Add totals
    const finalY = (doc as any).lastAutoTable?.finalY + 10 || 140;
    
    doc.setFont("helvetica", "bold");
    safeAddText(doc, "Subtotal:", 130, finalY);
    safeAddText(doc, "IVA:", 130, finalY + 6);
    safeAddText(doc, "Total:", 130, finalY + 12);
    
    doc.setFont("helvetica", "normal");
    safeAddText(doc, formatCurrency(invoice.subtotal || 0), 170, finalY, { align: "right" });
    safeAddText(doc, formatCurrency(invoice.tax_amount || 0), 170, finalY + 6, { align: "right" });
    safeAddText(doc, formatCurrency(invoice.total_amount || 0), 170, finalY + 12, { align: "right" });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    const footerText = "Este documento es una representación impresa de un CFDI";
    const textWidth = doc.getTextWidth(footerText);
    const pageWidth = doc.internal.pageSize.getWidth();
    safeAddText(doc, footerText, pageWidth / 2 - textWidth / 2, doc.internal.pageSize.getHeight() - 15);
    
    // Add UUID as reference in the footer if available
    if (invoice.uuid) {
      doc.setFontSize(8);
      safeAddText(doc, `UUID: ${invoice.uuid}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }
  } catch (error) {
    console.error("Error adding totals or footer:", error);
  }
  
  return doc;
};

/**
 * Main function to generate a PDF for an invoice
 */
export const generateInvoicePdf = async (
  invoiceId: number,
  issuerRfc: string
): Promise<PdfGenerationResult> => {
  try {
    console.log(`Starting PDF generation for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);

    // Input validation
    if (!invoiceId) {
      return {
        success: false,
        error: "Se requiere un ID de factura válido para generar el PDF"
      };
    }

    // 1. Get invoice data
    const invoice = await fetchInvoiceData(invoiceId);
    if (!invoice) {
      return {
        success: false,
        error: "No se pudo encontrar la factura en la base de datos"
      };
    }

    // 2. Get invoice products
    const products = await fetchInvoiceProducts(invoiceId);

    // 3. Try to get PDF template configuration
    const templateConfig = await fetchTemplateConfig(issuerRfc);
    
    // 4. Generate PDF
    const doc = generatePdfDocument(invoice, products, templateConfig);
    
    // 5. Save the file
    const filename = createPdfFilename(
      invoice.invoice_number,
      invoice.serie,
      invoice.uuid,
      invoice.issuer_name,
      invoiceId
    );
    
    doc.save(filename);
    console.log("PDF saved successfully with filename:", filename);
    
    return { 
      success: true,
      filename 
    };
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
