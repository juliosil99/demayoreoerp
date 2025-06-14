import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  formatCurrency, 
  getInvoiceIdentifier,
  getFormattedDate,
  safeAddText,
  formatRFC,
  formatComprobanteFiscal,
  formatTaxRegime
} from "@/utils/pdfGenerationUtils";
import { addQRCodeToPdf } from "./qrCodeService";
import type { InvoiceData, ProductData, PdfTemplate, EntityData } from "./databaseService";

/**
 * Generates the SAT-compliant PDF document for an invoice
 */
export const generateSATCompliantPdf = async (
  invoice: InvoiceData, 
  products: ProductData[], 
  templateConfig: PdfTemplate | null,
  issuerDetails: EntityData | null,
  receiverDetails: EntityData | null
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
  yPosition = addIssuerSection(doc, invoice, templateConfig, issuerDetails, yPosition);
  
  // Receiver Section
  yPosition = addReceiverSection(doc, invoice, receiverDetails, yPosition);
  
  // Products table
  let tableFinalY = await addProductsTable(doc, products, yPosition);
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomSectionMinHeight = 100; // Estimated height for seal, totals, and QR

  // Check if a new page is needed for the bottom section
  if (tableFinalY > pageHeight - bottomSectionMinHeight) {
    doc.addPage();
    tableFinalY = 20; // Start at top of new page
  }
  
  // Digital seal and tax sections start at the same Y position
  const sealY = addDigitalSealSection(doc, invoice, tableFinalY);
  addTaxSection(doc, invoice, tableFinalY);
  
  // Add QR code below the seal section
  await addQRCodeToPdf(doc, invoice, sealY);
  
  // Footer
  addFooter(doc, invoice);
  
  return doc;
};

const addIssuerSection = (doc: jsPDF, invoice: InvoiceData, templateConfig: PdfTemplate | null, issuerDetails: EntityData | null, yPosition: number): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  safeAddText(doc, "DATOS DEL EMISOR", 14, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Prioritize contact data, then invoice data, then fallback
  const issuerName = issuerDetails?.name || invoice.issuer_name || "No disponible";
  const issuerRfc = formatRFC(invoice.issuer_rfc);
  const taxRegime = formatTaxRegime(issuerDetails?.tax_regime || invoice.issuer_tax_regime);
  
  safeAddText(doc, `Razón Social: ${issuerName}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `RFC: ${issuerRfc}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `Régimen Fiscal: ${taxRegime || 'No especificado'}`, 14, yPosition);
  
  // Address: contact -> template -> none
  const addressFromContact = issuerDetails?.address 
    ? `${issuerDetails.address}${issuerDetails.postal_code ? `, C.P. ${issuerDetails.postal_code}` : ''}`
    : null;
  const address = addressFromContact || templateConfig?.address;
  if (address) {
    yPosition += 5;
    safeAddText(doc, `Domicilio: ${address}`, 14, yPosition);
  }

  // Phone: contact -> template -> none
  const phone = issuerDetails?.phone || templateConfig?.phone;
  if (phone) {
    yPosition += 5;
    safeAddText(doc, `Teléfono: ${phone}`, 14, yPosition);
  }

  // Email and Website are only in templateConfig
  if (templateConfig?.email) {
    yPosition += 5;
    safeAddText(doc, `Email: ${templateConfig.email}`, 14, yPosition);
  }
  if (templateConfig?.website) {
    yPosition += 5;
    safeAddText(doc, `Sitio Web: ${templateConfig.website}`, 14, yPosition);
  }
  
  return yPosition + 15;
};

const addReceiverSection = (doc: jsPDF, invoice: InvoiceData, receiverDetails: EntityData | null, yPosition: number): number => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  safeAddText(doc, "DATOS DEL RECEPTOR", 14, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const receiverName = receiverDetails?.name || invoice.receiver_name || "No disponible";

  safeAddText(doc, `Razón Social: ${receiverName}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `RFC: ${formatRFC(invoice.receiver_rfc)}`, 14, yPosition);
  yPosition += 5;

  if (receiverDetails) {
    if (receiverDetails.address) {
      const address = receiverDetails.postal_code 
        ? `${receiverDetails.address}, C.P. ${receiverDetails.postal_code}`
        : receiverDetails.address;
      safeAddText(doc, `Domicilio: ${address}`, 14, yPosition);
      yPosition += 5;
    }
    if (receiverDetails.phone) {
      safeAddText(doc, `Teléfono: ${receiverDetails.phone}`, 14, yPosition);
      yPosition += 5;
    }
  }

  safeAddText(doc, `Régimen Fiscal: ${invoice.receiver_tax_regime || 'No especificado'}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `Uso del CFDI: ${invoice.receiver_cfdi_use || 'No especificado'}`, 14, yPosition);
  
  return yPosition + 15;
};

const addProductsTable = async (doc: jsPDF, products: ProductData[], yPosition: number): Promise<number> => {
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
    return yPosition + 10;
  }
  
  return (doc as any).lastAutoTable?.finalY + 15 || yPosition + 50;
};

const addTaxSection = (doc: jsPDF, invoice: InvoiceData, yPosition: number): number => {
  const startX = 130;
  const valueX = 195;
  const rightAlign = { align: "right" as const };

  let currentY = yPosition;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "Subtotal:", startX, currentY);
  doc.setFont("helvetica", "normal");
  safeAddText(doc, formatCurrency(invoice.subtotal || 0), valueX, currentY, rightAlign);
  
  currentY += 7;

  // Taxes
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "Total Impuestos:", startX, currentY);
  doc.setFont("helvetica", "normal");
  safeAddText(doc, formatCurrency(invoice.tax_amount || 0), valueX, currentY, rightAlign);
  
  currentY += 7;

  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "TOTAL:", startX, currentY);
  safeAddText(doc, formatCurrency(invoice.total_amount || 0), valueX, currentY, rightAlign);
  
  return currentY + 15;
};

const addDigitalSealSection = (doc: jsPDF, invoice: InvoiceData, yPosition: number): number => {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "CERTIFICACIÓN DIGITAL SAT", 14, yPosition);
  
  let sealY = yPosition + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  const maxWidth = 100;
  const lineHeight = 4;

  if (invoice.uuid) {
    const text = `UUID: ${invoice.uuid}`;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 14, sealY);
    sealY += lines.length * lineHeight;
  }
  
  if (invoice.certificate_number) {
    const text = `No. Certificado Emisor: ${invoice.certificate_number}`;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 14, sealY);
    sealY += lines.length * lineHeight;
  }
  
  if (invoice.sat_certificate_number) {
    const text = `No. Certificado SAT: ${invoice.sat_certificate_number}`;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 14, sealY);
    sealY += lines.length * lineHeight;
  }
  
  if (invoice.cfdi_stamp) {
    const text = `Sello Digital Emisor: ${invoice.cfdi_stamp}`;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 14, sealY);
    sealY += lines.length * lineHeight;
  }
  
  if (invoice.sat_stamp) {
    const text = `Sello Digital SAT: ${invoice.sat_stamp}`;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 14, sealY);
    sealY += lines.length * lineHeight;
  }
  
  return sealY + 10;
};

const addFooter = (doc: jsPDF, invoice: InvoiceData): void => {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    
    const footerY = pageHeight - 25;
    safeAddText(doc, "Este documento es una representación impresa de un CFDI", pageWidth / 2, footerY, { align: "center" });
    
    if (invoice.stamp_date) {
      const stampDate = new Date(invoice.stamp_date).toLocaleString('es-MX');
      safeAddText(doc, `Fecha y hora de certificación: ${stampDate}`, pageWidth / 2, footerY + 4, { align: "center" });
    }
    
    // Add UUID in footer if available
    if (invoice.uuid) {
      safeAddText(doc, `Folio Fiscal (UUID): ${invoice.uuid}`, pageWidth / 2, footerY + 8, { align: "center" });
    }

    safeAddText(doc, `Página ${i} de ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }
};
