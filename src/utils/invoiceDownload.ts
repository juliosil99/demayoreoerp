
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
    console.log("Attempting to download file:", filePath);
    
    // First check if the path looks valid
    if (!filePath || filePath.trim() === '') {
      console.error("Invalid file path:", filePath);
      toast.error("La ruta del archivo no es válida");
      return;
    }

    // Extract bucket path and file name for better error handling
    const pathParts = filePath.split('/');
    const fileNameFromPath = pathParts.pop() || '';
    const bucketPath = pathParts.join('/');
    
    console.log("Bucket path:", bucketPath);
    console.log("File name from path:", fileNameFromPath);
    
    // First check if file exists (doesn't actually download it)
    const { data: fileList, error: fileCheckError } = await supabase.storage
      .from('invoices')
      .list(bucketPath, {
        search: fileNameFromPath
      });
      
    if (fileCheckError) {
      console.error("Error checking file existence:", fileCheckError);
      toast.error("Error verificando existencia del archivo: " + fileCheckError.message);
      return;
    }
    
    console.log("File check result:", fileList);
    
    if (!fileList || fileList.length === 0) {
      console.error("File not found in storage bucket:", filePath);
      
      // More descriptive error message for missing files
      toast.error(
        "Archivo no encontrado en el almacenamiento. " +
        "El registro existe en la base de datos pero el archivo físico no se encuentra en el bucket de almacenamiento. " +
        "Contacte al administrador del sistema."
      );
      return;
    }
    
    // If we get here, the file exists in the bucket, so attempt to download it
    const { data, error } = await supabase.storage
      .from('invoices')
      .download(filePath);
    
    if (error) {
      console.error("Error downloading file:", error);
      
      // More descriptive error message based on error type
      if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error("Archivo no encontrado. Verifique que exista en el almacenamiento.");
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        toast.error("No tiene permisos para acceder a este archivo.");
      } else {
        toast.error(`Error al descargar: ${error.message || "Error desconocido"}`);
      }
      return;
    }

    if (!data) {
      toast.error("No se pudo obtener el archivo.");
      return;
    }

    console.log("File downloaded successfully, size:", data.size);

    // If it's an XML file and we want to convert it to PDF, we could do that here
    if (isXmlFile(filePath, contentType)) {
      // For now, just download the XML file as is
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
    toast.error("Error al descargar el archivo: " + (error instanceof Error ? error.message : "Error desconocido"));
  }
};

/**
 * Creates a download from a blob
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
  try {
    console.log("Creating download for blob, size:", blob.size, "filename:", fileName);
    
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
      console.log("Download initiated and link cleaned up");
    }, 100);
  } catch (error) {
    console.error("Error in downloadBlob:", error);
    toast.error("Error al preparar la descarga del archivo");
  }
};
