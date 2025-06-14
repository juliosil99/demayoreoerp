
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
import type { InvoiceData, ProductData, PdfTemplate, IssuerContactData } from "./databaseService";

/**
 * Generates the SAT-compliant PDF document for an invoice
 */
export const generateSATCompliantPdf = async (
  invoice: InvoiceData, 
  products: ProductData[], 
  templateConfig: PdfTemplate | null,
  issuerContactData: IssuerContactData | null
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
  yPosition = addIssuerSection(doc, invoice, templateConfig, issuerContactData, yPosition);
  
  // Receiver Section
  yPosition = addReceiverSection(doc, invoice, yPosition);
  
  // Products table
  const finalY = await addProductsTable(doc, products, yPosition);
  
  // Tax breakdown and totals
  const taxY = addTaxSection(doc, invoice, finalY);
  
  // Digital seal section
  const sealY = addDigitalSealSection(doc, invoice, taxY);
  
  // Add QR code
  await addQRCodeToPdf(doc, invoice, sealY);
  
  // Footer
  addFooter(doc, invoice);
  
  return doc;
};

const addIssuerSection = (doc: jsPDF, invoice: InvoiceData, templateConfig: PdfTemplate | null, issuerContactData: IssuerContactData | null, yPosition: number): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  safeAddText(doc, "DATOS DEL EMISOR", 14, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Prioritize contact data, then invoice data, then fallback
  const issuerName = issuerContactData?.name || invoice.issuer_name || "No disponible";
  const issuerRfc = formatRFC(invoice.issuer_rfc);
  const taxRegime = formatTaxRegime(issuerContactData?.tax_regime || invoice.issuer_tax_regime);
  
  safeAddText(doc, `Razón Social: ${issuerName}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `RFC: ${issuerRfc}`, 14, yPosition);
  yPosition += 5;
  safeAddText(doc, `Régimen Fiscal: ${taxRegime || 'No especificado'}`, 14, yPosition);
  
  // Address: contact -> template -> none
  const addressFromContact = issuerContactData?.address 
    ? `${issuerContactData.address}${issuerContactData.postal_code ? `, C.P. ${issuerContactData.postal_code}` : ''}`
    : null;
  const address = addressFromContact || templateConfig?.address;
  if (address) {
    yPosition += 5;
    safeAddText(doc, `Domicilio: ${address}`, 14, yPosition);
  }

  // Phone: contact -> template -> none
  const phone = issuerContactData?.phone || templateConfig?.phone;
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

const addReceiverSection = (doc: jsPDF, invoice: InvoiceData, yPosition: number): number => {
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
  // Tax breakdown section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "DESGLOSE DE IMPUESTOS", 14, yPosition);
  
  let taxY = yPosition + 10;
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
  
  return taxY + 15;
};

const addDigitalSealSection = (doc: jsPDF, invoice: InvoiceData, yPosition: number): number => {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  safeAddText(doc, "CERTIFICACIÓN DIGITAL SAT", 14, yPosition);
  
  let sealY = yPosition + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  if (invoice.uuid) {
    safeAddText(doc, `UUID: ${invoice.uuid}`, 14, sealY);
    sealY += 4;
  }
  
  if (invoice.certificate_number) {
    safeAddText(doc, `No. Certificado Emisor: ${invoice.certificate_number}`, 14, sealY);
    sealY += 4;
  }
  
  if (invoice.sat_certificate_number) {
    safeAddText(doc, `No. Certificado SAT: ${invoice.sat_certificate_number}`, 14, sealY);
    sealY += 4;
  }
  
  if (invoice.cfdi_stamp) {
    const selloDigital = invoice.cfdi_stamp.substring(invoice.cfdi_stamp.length - 8);
    safeAddText(doc, `Sello Digital Emisor: ...${selloDigital}`, 14, sealY);
    sealY += 4;
  }
  
  if (invoice.sat_stamp) {
    const selloSAT = invoice.sat_stamp.substring(invoice.sat_stamp.length - 8);
    safeAddText(doc, `Sello Digital SAT: ...${selloSAT}`, 14, sealY);
    sealY += 4;
  }
  
  return sealY + 10;
};

const addFooter = (doc: jsPDF, invoice: InvoiceData): void => {
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
};
