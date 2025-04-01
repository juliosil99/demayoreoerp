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
export const downloadInvoiceFile = async (filePath: string, fileName: string, contentType?: string | null): Promise<boolean> => {
  try {
    console.log("[downloadInvoiceFile] Attempting to download file:", filePath);
    console.log("[downloadInvoiceFile] With filename:", fileName);
    console.log("[downloadInvoiceFile] Content type:", contentType);
    
    // First check if the path looks valid
    if (!filePath || filePath.trim() === '') {
      console.error("[downloadInvoiceFile] Invalid file path:", filePath);
      toast.error("La ruta del archivo no es válida");
      return false;
    }

    // Determine which bucket to use based on file path pattern
    // For manually uploaded PDF files, they'll be in the invoice_files bucket
    // For XML/invoice files, they'll be in the invoices bucket
    const bucket = filePath.includes('/') && !filePath.startsWith('invoices/') 
      ? 'invoice_files' 
      : 'invoices';
      
    console.log(`[downloadInvoiceFile] Using storage bucket: ${bucket}`);

    // Extract bucket path and file name for better error handling
    const pathParts = filePath.split('/');
    const fileNameFromPath = pathParts.pop() || '';
    const bucketPath = pathParts.join('/');
    
    console.log("[downloadInvoiceFile] Bucket path:", bucketPath);
    console.log("[downloadInvoiceFile] File name from path:", fileNameFromPath);
    
    // First check if file exists (doesn't actually download it)
    const { data: fileList, error: fileCheckError } = await supabase.storage
      .from(bucket)
      .list(bucketPath, {
        search: fileNameFromPath
      });
      
    if (fileCheckError) {
      console.error("[downloadInvoiceFile] Error checking file existence:", fileCheckError);
      toast.error("Error verificando existencia del archivo: " + fileCheckError.message);
      return false;
    }
    
    console.log("[downloadInvoiceFile] File check result:", fileList);
    
    if (!fileList || fileList.length === 0) {
      console.error("[downloadInvoiceFile] File not found in storage bucket:", filePath);
      
      // More descriptive error message for missing files
      toast.error(
        "Archivo no encontrado en el almacenamiento. " +
        "El registro existe en la base de datos pero el archivo físico no se encuentra en el bucket de almacenamiento. " +
        "Es posible que el archivo nunca se haya subido correctamente o que haya sido eliminado."
      );
      return false;
    }
    
    // If we get here, the file exists in the bucket, so attempt to download it
    console.log("[downloadInvoiceFile] File exists, proceeding with download from bucket:", bucket);
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);
    
    if (error) {
      console.error("[downloadInvoiceFile] Error downloading file:", error);
      
      // More descriptive error message based on error type
      if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error("Archivo no encontrado. Verifique que exista en el almacenamiento.");
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        toast.error("No tiene permisos para acceder a este archivo.");
      } else {
        toast.error(`Error al descargar: ${error.message || "Error desconocido"}`);
      }
      return false;
    }

    if (!data) {
      console.error("[downloadInvoiceFile] No data returned from storage download");
      toast.error("No se pudo obtener el archivo.");
      return false;
    }

    console.log("[downloadInvoiceFile] File downloaded successfully, size:", data.size);

    // If it's an XML file and we want to convert it to PDF, we could do that here
    if (isXmlFile(filePath, contentType)) {
      console.log("[downloadInvoiceFile] XML file detected, downloading as XML");
      // For now, just download the XML file as is
      downloadBlob(data, `${fileName}.xml`);
      return true;
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

    console.log("[downloadInvoiceFile] Using file extension:", extension);
    
    // Download the file with the appropriate extension
    downloadBlob(data, `${fileName}.${extension}`);
    return true;
    
  } catch (error) {
    console.error("[downloadInvoiceFile] Error in download process:", error);
    toast.error("Error al descargar el archivo: " + (error instanceof Error ? error.message : "Error desconocido"));
    return false;
  }
};

/**
 * Creates a download from a blob
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
  try {
    console.log("[downloadBlob] Creating download for blob, size:", blob.size, "filename:", fileName);
    
    // Create an object URL for the blob
    const url = window.URL.createObjectURL(blob);
    console.log("[downloadBlob] Created URL:", url);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Append to body, click and remove
    document.body.appendChild(link);
    console.log("[downloadBlob] Link added to DOM, initiating click");
    link.click();
    
    // Clean up - Increased timeout to give browser more time to handle the download
    setTimeout(() => {
      console.log("[downloadBlob] Starting cleanup in setTimeout");
      try {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log("[downloadBlob] Download initiated and link cleaned up");
      } catch (cleanupError) {
        console.error("[downloadBlob] Error during cleanup:", cleanupError);
      }
    }, 5000); // Increased timeout to 5 seconds from 3 seconds
  } catch (error) {
    console.error("[downloadBlob] Error in downloadBlob:", error);
    toast.error("Error al preparar la descarga del archivo");
  }
};
