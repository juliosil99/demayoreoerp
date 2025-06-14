
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { toast } from "@/components/ui/use-toast";
import { 
  formatCurrency, 
  createPdfFilename,
  getInvoiceIdentifier,
  getFormattedDate,
  safeAddText,
  formatRFC,
  formatComprobanteFiscal
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
  issuer_tax_regime?: string | null;
  receiver_name?: string | null;
  receiver_rfc?: string | null;
  receiver_tax_regime?: string | null;
  receiver_cfdi_use?: string | null;
  uuid?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  currency?: string | null;
  exchange_rate?: number | null;
  payment_method?: string | null;
  payment_form?: string | null;
  invoice_type?: string | null;
  certificate_number?: string | null;
  sat_certificate_number?: string | null;
  cfdi_stamp?: string | null;
  sat_stamp?: string | null;
}

interface ProductData {
  quantity?: number | null;
  description?: string | null;
  unit_value?: number | null;
  amount?: number | null;
  unit?: string | null;
  product_key?: string | null;
  unit_key?: string | null;
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
  } catch (err) {
    console.error("Error in fetchInvoiceData:", err);
    throw err;
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
  } catch (err) {
    console.error("Error in fetchInvoiceProducts:", err);
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
  } catch (err) {
    console.log("Error fetching template, continuing with default:", err);
    return null;
  }
};

/**
 * Generates QR code for SAT compliance
 */
const generateQRCode = async (
  issuerRfc: string,
  receiverRfc: string,
  total: number,
  uuid: string
): Promise<string> => {
  try {
    const qrData = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${issuerRfc}&rr=${receiverRfc}&tt=${total.toFixed(6)}&fe=${uuid.substring(uuid.length - 8)}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Adds QR code to PDF
 */
const addQRCodeToPdf = async (
  doc: jsPDF,
  invoice: InvoiceData,
  yPosition: number
): Promise<void> => {
  try {
    if (!invoice.uuid || !invoice.issuer_rfc || !invoice.receiver_rfc || !invoice.total_amount) {
      console.log("Missing required data for QR code generation");
      return;
    }

    const qrCodeDataURL = await generateQRCode(
      invoice.issuer_rfc,
      invoice.receiver_rfc,
      invoice.total_amount,
      invoice.uuid
    );

    // Position QR code in bottom right corner
    const pageWidth = doc.internal.pageSize.getWidth();
    const qrSize = 30;
    const margin = 15;
    
    doc.addImage(qrCodeDataURL, 'PNG', pageWidth - qrSize - margin, yPosition, qrSize, qrSize);
    
    // Add QR code label
    doc.setFontSize(8);
    doc.setTextColor(100);
    safeAddText(doc, "Código QR SAT", pageWidth - qrSize - margin + (qrSize/2), yPosition + qrSize + 5, { align: "center" });
  } catch (err) {
    console.error("Error adding QR code to PDF:", err);
  }
};

/**
 * Generates the SAT-compliant PDF document for an invoice
 */
const generateSATCompiantPdf = async (
  invoice: InvoiceData, 
  products: ProductData[], 
  templateConfig: PdfTemplate | null
): Promise<jsPDF> => {
  const doc = new jsPDF();
  let yPosition = 20;
  
  // Header - CFDI Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  safeAddText(doc, "COMPROBANTE FISCAL DIGITAL POR INTERNET", doc.internal.pageSize.getWidth() / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  
  // Invoice identifier and date
  doc.setFontSize(14);
  const invoiceNumber = getInvoiceIdentifier(invoice.serie, invoice.invoice_number, invoice.uuid);
  const invoiceDate = getFormattedDate(invoice.invoice_date, invoice.stamp_date);
  
  safeAddText(doc, `Folio Fiscal: ${invoiceNumber}`, 14, yPosition);
  safeAddText(doc, `Fecha: ${invoiceDate}`, 120, yPosition);
  
  yPosition += 10;
  
  // Invoice type and other fiscal data
  doc.setFontSize(10);
  const invoiceType = formatComprobanteFiscal(invoice.invoice_type);
  safeAddText(doc, `Tipo de Comprobante: ${invoiceType}`, 14, yPosition);
  safeAddText(doc, `Moneda: ${invoice.currency || 'MXN'}`, 120, yPosition);
  
  yPosition += 6;
  safeAddText(doc, `Forma de Pago: ${invoice.payment_form || 'No especificada'}`, 14, yPosition);
  safeAddText(doc, `Método de Pago: ${invoice.payment_method || 'No especificado'}`, 120, yPosition);
  
  yPosition += 15;
  
  // Issuer Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  safeAddText(doc, "DATOS DEL EMISOR", 14, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const issuerName = invoice.issuer_name || "No disponible";
  const issuerRfc = formatRFC(invoice.issuer_rfc);
  
  safeAddText(doc, `Razón Social: ${issuerName}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `RFC: ${issuerRfc}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `Régimen Fiscal: ${invoice.issuer_tax_regime || 'No especificado'}`, 14, yPosition);
  
  // Add template info if available
  if (templateConfig) {
    if (templateConfig.address) {
      yPosition += 5;
      safeAddText(doc, `Domicilio: ${templateConfig.address}`, 14, yPosition);
    }
    if (templateConfig.phone) {
      yPosition += 5;
      safeAddText(doc, `Teléfono: ${templateConfig.phone}`, 14, yPosition);
    }
    if (templateConfig.email) {
      yPosition += 5;
      safeAddText(doc, `Email: ${templateConfig.email}`, 14, yPosition);
    }
  }
  
  yPosition += 15;
  
  // Receiver Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  safeAddText(doc, "DATOS DEL RECEPTOR", 14, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  safeAddText(doc, `Razón Social: ${invoice.receiver_name || "No disponible"}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `RFC: ${formatRFC(invoice.receiver_rfc)}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `Régimen Fiscal: ${invoice.receiver_tax_regime || 'No especificado'}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `Uso del CFDI: ${invoice.receiver_cfdi_use || 'No especificado'}`, 14, yPosition);
  
  yPosition += 15;
  
  // Products table with SAT format
  try {
    const tableColumn = [
      "Clave\nProd/Serv",
      "Clave\nUnidad", 
      "Cantidad",
      "Descripción",
      "Valor\nUnitario",
      "Importe"
    ];
    
    const tableRows = products && products.length > 0 
      ? products.map(product => [
          product.product_key || "N/A",
          product.unit_key || "N/A",
          product.quantity?.toString() || "1",
          product.description || "Sin descripción",
          formatCurrency(product.unit_value || 0),
          formatCurrency(product.amount || 0)
        ])
      : [["--", "--", "--", "No se encontraron productos", "--", "--"]];
    
    autoTable(doc, {
      startY: yPosition,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255,
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 80 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' }
      }
    });
  } catch (tableError) {
    console.error("Error generating products table:", tableError);
    doc.setFontSize(10);
    safeAddText(doc, "Error al generar tabla de productos", 14, yPosition);
    yPosition += 10;
  }
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY + 15 || yPosition + 50;
  
  // Tax breakdown section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "DESGLOSE DE IMPUESTOS", 14, finalY);
  
  let taxY = finalY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Tax details
  safeAddText(doc, "Impuestos Trasladados:", 14, taxY);
  taxY += 5;
  safeAddText(doc, `IVA (16%): ${formatCurrency(invoice.tax_amount || 0)}`, 20, taxY);
  
  taxY += 10;
  
  // Totals section
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "Subtotal:", 130, taxY);
  safeAddText(doc, formatCurrency(invoice.subtotal || 0), 170, taxY, { align: "right" });
  
  taxY += 6;
  safeAddText(doc, "Total Impuestos:", 130, taxY);
  safeAddText(doc, formatCurrency(invoice.tax_amount || 0), 170, taxY, { align: "right" });
  
  taxY += 6;
  doc.setFontSize(12);
  safeAddText(doc, "TOTAL:", 130, taxY);
  safeAddText(doc, formatCurrency(invoice.total_amount || 0), 170, taxY, { align: "right" });
  
  taxY += 15;
  
  // Digital seal section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "CERTIFICACIÓN DIGITAL SAT", 14, taxY);
  
  taxY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  if (invoice.uuid) {
    safeAddText(doc, `UUID: ${invoice.uuid}`, 14, taxY);
    taxY += 4;
  }
  
  if (invoice.certificate_number) {
    safeAddText(doc, `No. Certificado Emisor: ${invoice.certificate_number}`, 14, taxY);
    taxY += 4;
  }
  
  if (invoice.sat_certificate_number) {
    safeAddText(doc, `No. Certificado SAT: ${invoice.sat_certificate_number}`, 14, taxY);
    taxY += 4;
  }
  
  if (invoice.cfdi_stamp) {
    const selloDigital = invoice.cfdi_stamp.substring(invoice.cfdi_stamp.length - 8);
    safeAddText(doc, `Sello Digital Emisor: ...${selloDigital}`, 14, taxY);
    taxY += 4;
  }
  
  if (invoice.sat_stamp) {
    const selloSAT = invoice.sat_stamp.substring(invoice.sat_stamp.length - 8);
    safeAddText(doc, `Sello Digital SAT: ...${selloSAT}`, 14, taxY);
    taxY += 4;
  }
  
  taxY += 10;
  
  // Add QR code
  await addQRCodeToPdf(doc, invoice, taxY);
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100);
  
  const footerY = pageHeight - 25;
  safeAddText(doc, "Este documento es una representación impresa de un CFDI", doc.internal.pageSize.getWidth() / 2, footerY, { align: "center" });
  
  if (invoice.stamp_date) {
    const stampDate = new Date(invoice.stamp_date).toLocaleString('es-MX');
    safeAddText(doc, `Fecha y hora de certificación: ${stampDate}`, doc.internal.pageSize.getWidth() / 2, footerY + 4, { align: "center" });
  }
  
  // Add UUID in footer if available
  if (invoice.uuid) {
    safeAddText(doc, `Folio Fiscal (UUID): ${invoice.uuid}`, doc.internal.pageSize.getWidth() / 2, footerY + 8, { align: "center" });
  }
  
  return doc;
};

/**
 * Main function to generate a SAT-compliant PDF for an invoice
 */
export const generateInvoicePdf = async (
  invoiceId: number,
  issuerRfc: string
): Promise<PdfGenerationResult> => {
  try {
    console.log(`Starting SAT-compliant PDF generation for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);

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
    
    // 4. Generate SAT-compliant PDF
    const doc = await generateSATCompiantPdf(invoice, products, templateConfig);
    
    // 5. Save the file
    const filename = createPdfFilename(
      invoice.invoice_number,
      invoice.serie,
      invoice.uuid,
      invoice.issuer_name,
      invoiceId
    );
    
    doc.save(filename);
    console.log("SAT-compliant PDF saved successfully with filename:", filename);
    
    return { 
      success: true,
      filename 
    };
  } catch (err) {
    console.error("Unexpected error in SAT PDF generation:", err);
    return {
      success: false,
      error: err instanceof Error 
        ? `Error al generar PDF: ${err.message}` 
        : "Error desconocido al generar el PDF",
    };
  }
};
