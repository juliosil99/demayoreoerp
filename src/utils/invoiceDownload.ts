
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Determines if a file is an XML file based on its path or content type
 */
export const isXmlFile = (filePath: string, contentType?: string | null): boolean => {
  if (contentType?.includes('xml')) return true;
  return filePath.toLowerCase().endsWith('.xml');
};

/**
 * Downloads an invoice file from storage
 * @param filePath Path to the file in Supabase Storage
 * @param fileName Desired filename for the download
 */
export const downloadInvoiceFile = async (filePath: string, fileName: string, contentType?: string | null): Promise<void> => {
  try {
    // Get the file from storage
    const { data, error } = await supabase.storage
      .from('invoices')
      .download(filePath);
    
    if (error) {
      console.error("Error downloading file:", error);
      toast.error("Error al descargar el archivo");
      return;
    }

    if (!data) {
      toast.error("No se encontró el archivo");
      return;
    }

    // If it's an XML file and we want to convert it to PDF, we could do that here
    if (isXmlFile(filePath, contentType)) {
      // For now, just download the XML file as is
      // In a future implementation, we could convert XML to PDF
      downloadBlob(data, `${fileName}.xml`);
      return;
    }
    
    // Create a valid extension based on content type
    let extension = 'pdf';
    if (contentType) {
      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        extension = 'jpg';
      } else if (contentType.includes('png')) {
        extension = 'png';
      }
    } else {
      // Try to extract extension from file path
      const fileExtMatch = filePath.match(/\.([^.]+)$/);
      if (fileExtMatch) {
        extension = fileExtMatch[1].toLowerCase();
      }
    }

    // Download the file with the appropriate extension
    downloadBlob(data, `${fileName}.${extension}`);
    
  } catch (error) {
    console.error("Error in download process:", error);
    toast.error("Error al descargar el archivo");
  }
};

/**
 * Creates a download from a blob
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
  // Create an object URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Append to body, click and remove
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
};
