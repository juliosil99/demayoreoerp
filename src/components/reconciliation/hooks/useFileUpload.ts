
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
      return;
    }

    setUploading(true);
    setUploadError(null);
    onUploadStart();

    try {
      // Define the file path with better uniqueness
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}_${file.name}`;
      const filePath = `${user.id}/${uniqueFilename}`;
      
      console.log("Starting file upload process for:", file.name);
      console.log("File content type:", file.type);
      console.log("File size:", file.size);
      console.log("Target path:", filePath);

      // First, check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();
        
      if (bucketError) {
        console.error("Error listing buckets:", bucketError);
        throw new Error(`Error checking storage buckets: ${bucketError.message}`);
      }
      
      const invoiceFilesBucketExists = buckets?.some(bucket => bucket.name === 'invoice_files');
      
      if (!invoiceFilesBucketExists) {
        console.error("The 'invoice_files' bucket does not exist");
        throw new Error("Storage bucket 'invoice_files' does not exist. Please contact system administrator.");
      }
      
      console.log("Confirmed 'invoice_files' bucket exists");

      // Upload the actual file to 'invoice_files' bucket first
      const { data: uploadData, error: storageError } = await supabase.storage
        .from('invoice_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error("Error uploading file to storage:", storageError);
        throw new Error(`Error uploading file: ${storageError.message}`);
      }
      
      console.log("File uploaded successfully to storage:", uploadData?.path);

      // After successful upload, create file metadata record
      const { data: fileRecord, error: fileError } = await supabase
        .from("manual_invoice_files")
        .insert({
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          size: file.size,
          user_id: user.id
        })
        .select()
        .single();

      if (fileError) {
        // Clean up the uploaded file if the database record fails
        await supabase.storage
          .from('invoice_files')
          .remove([filePath]);
          
        console.error("Error creating file record in database:", fileError);
        throw new Error(`Error creating file record: ${fileError.message}`);
      }
      
      if (!fileRecord) {
        // Clean up the uploaded file if the database record doesn't return
        await supabase.storage
          .from('invoice_files')
          .remove([filePath]);
          
        throw new Error("Failed to create file record in database");
      }

      console.log("Database record created successfully:", fileRecord.id);
      
      // Now verify the file exists in storage
      const { data: fileCheck, error: fileCheckError } = await supabase.storage
        .from('invoice_files')
        .list(user.id, {
          search: uniqueFilename
        });
        
      if (fileCheckError) {
        console.error("Error verifying file existence:", fileCheckError);
      } else if (!fileCheck || fileCheck.length === 0) {
        console.error("File verification failed - file was not found after upload");
        throw new Error("File upload appeared successful but verification failed. Please try again.");
      } else {
        console.log("File verified in storage:", fileCheck[0]?.name);
      }

      setUploadSuccess(true);
      console.log("Upload process completed successfully");
      
      // Add a small delay before calling onUploadComplete to prevent any race conditions
      setTimeout(() => {
        onUploadComplete(fileRecord.id);
      }, 300);
      
      toast.success("Archivo subido exitosamente");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al subir el archivo";
      console.error("Upload error:", errorMessage);
      setUploadError(errorMessage);
      toast.error("Error al subir el archivo: " + errorMessage);
    } finally {
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
