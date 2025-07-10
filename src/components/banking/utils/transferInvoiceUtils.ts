import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadTransferInvoice = async (
  file: File,
  userId: string,
  transferId?: string
): Promise<{ path: string; filename: string; size: number; contentType: string } | null> => {
  try {
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${file.name}`;
    const filePath = `${userId}/${filename}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('transfer-invoices')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Error al subir el archivo: ' + uploadError.message);
      return null;
    }

    return {
      path: filePath,
      filename: file.name,
      size: file.size,
      contentType: file.type
    };
  } catch (error) {
    console.error('Error uploading transfer invoice:', error);
    toast.error('Error al subir el comprobante');
    return null;
  }
};

export const downloadTransferInvoice = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('transfer-invoices')
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      toast.error('Error al descargar el archivo');
      return;
    }

    // Create download URL and trigger download
    const url = URL.createObjectURL(data);
    const filename = filePath.split('/').pop() || 'comprobante';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading transfer invoice:', error);
    toast.error('Error al descargar el comprobante');
  }
};

export const deleteTransferInvoice = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('transfer-invoices')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting transfer invoice:', error);
    throw error;
  }
};

export const validateInvoiceFile = (file: File): boolean => {
  const validTypes = ['application/pdf', 'application/xml', 'text/xml'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    toast.error('Solo se permiten archivos PDF y XML');
    return false;
  }

  if (file.size > maxSize) {
    toast.error('El archivo no puede ser mayor a 10MB');
    return false;
  }

  return true;
};