
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFileUpload({
  onUploadStart,
  onUploadComplete,
}: {
  onUploadStart: () => void;
  onUploadComplete: (fileId: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("[useFileUpload] File selected:", selectedFile.name, "size:", selectedFile.size);
      setFile(selectedFile);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent propagation and default to avoid form submission
    e.preventDefault();
    e.stopPropagation();
    
    if (!file || !user) {
      console.log("[useFileUpload] Upload canceled - no file or user");
      return;
    }

    console.log("[useFileUpload] Starting upload for file:", file.name);
    setUploading(true);
    setUploadError(null);
    onUploadStart();

    try {
      console.log("[useFileUpload] Creating file metadata record in database...");
      
      // Create file metadata record first
      const { data: fileRecord, error: fileError } = await supabase
        .from("manual_invoice_files")
        .insert({
          filename: file.name,
          file_path: `${user.id}/${Date.now()}_${file.name}`,
          content_type: file.type,
          size: file.size,
          user_id: user.id
        })
        .select()
        .single();

      if (fileError) {
        console.error("[useFileUpload] Error creating file record:", fileError);
        throw new Error(`Error creating file record: ${fileError.message}`);
      }
      
      if (!fileRecord) {
        console.error("[useFileUpload] No file record returned after insert");
        throw new Error("Failed to create file record");
      }

      console.log("[useFileUpload] File record created with ID:", fileRecord.id);

      // Upload the actual file to 'invoice_files' bucket
      console.log(`[useFileUpload] Uploading file to invoice_files bucket: ${fileRecord.file_path}`);
      const { error: storageError } = await supabase.storage
        .from('invoice_files')
        .upload(fileRecord.file_path, file);

      if (storageError) {
        // Clean up the database entry since the upload failed
        console.error("[useFileUpload] Storage upload error:", storageError);
        console.log("[useFileUpload] Cleaning up failed file record:", fileRecord.id);
        await supabase
          .from("manual_invoice_files")
          .delete()
          .eq("id", fileRecord.id);
        throw new Error(`Error uploading file: ${storageError.message}`);
      }

      console.log("[useFileUpload] File upload successful!");
      setUploadSuccess(true);
      
      // Log before calling onUploadComplete
      console.log("[useFileUpload] Upload process completed, uploading state set to false");
      setUploading(false);
      
      // Add a small delay before calling onUploadComplete to prevent any race conditions
      setTimeout(() => {
        console.log("[useFileUpload] Calling onUploadComplete with file ID:", fileRecord.id);
        onUploadComplete(fileRecord.id);
      }, 300);
      
      toast.success("Archivo subido exitosamente");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al subir el archivo";
      console.error("[useFileUpload] Upload error:", errorMessage);
      setUploadError(errorMessage);
      toast.error("Error al subir el archivo");
      setUploading(false);
    }
  };

  return {
    file,
    uploading,
    uploadError,
    uploadSuccess,
    handleFileChange,
    handleUpload
  };
}
