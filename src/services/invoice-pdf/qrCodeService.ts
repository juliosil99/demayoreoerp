
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { safeAddText } from "@/utils/pdfGenerationUtils";
import type { InvoiceData } from "./databaseService";

/**
 * Generates QR code for SAT compliance
 */
export const generateQRCode = async (
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
export const addQRCodeToPdf = async (
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
