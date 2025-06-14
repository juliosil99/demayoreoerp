import qr from "qrcode-generator";
import { jsPDF } from "jspdf";
import { safeAddText } from "@/utils/pdfGenerationUtils";
import type { InvoiceData } from "./databaseService";

/**
 * Generates QR code for SAT compliance using qrcode-generator
 */
export const generateQRCode = async (
  issuerRfc: string,
  receiverRfc: string,
  total: number,
  uuid: string
): Promise<string> => {
  try {
    const qrData = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${issuerRfc}&rr=${receiverRfc}&tt=${total.toFixed(6)}&fe=${uuid.substring(uuid.length - 8)}`;
    
    // Create QR code using qrcode-generator
    const qrCode = qr(0, 'M'); // Type 0 (auto), Error correction level M
    qrCode.addData(qrData);
    qrCode.make();
    
    // Get the module count
    const moduleCount = qrCode.getModuleCount();
    const cellSize = 4; // Size of each QR module in pixels
    const margin = 2; // Margin around QR code
    const size = moduleCount * cellSize + 2 * margin;
    
    // Create canvas to draw QR code
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrCode.isDark(row, col)) {
          ctx.fillRect(
            col * cellSize + margin,
            row * cellSize + margin,
            cellSize,
            cellSize
          );
        }
      }
    }
    
    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
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

    // Position QR code on the left side, under seal info
    const qrSize = 30;
    const margin = 14;
    
    doc.addImage(qrCodeDataURL, 'PNG', margin, yPosition, qrSize, qrSize);
    
    // Add QR code label
    doc.setFontSize(8);
    doc.setTextColor(100);
    safeAddText(doc, "Código QR SAT", margin + (qrSize/2), yPosition + qrSize + 5, { align: "center" });
  } catch (err) {
    console.error("Error adding QR code to PDF:", err);
    // Continue without QR code if generation fails
    console.log("PDF will be generated without QR code");
  }
};
