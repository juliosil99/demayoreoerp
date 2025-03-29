
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadStart: () => void;
  onUploadComplete: (fileId: string) => void;
  acceptedTypes?: string;
}

export function FileUploader({ 
  onUploadStart, 
  onUploadComplete,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png" 
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadError(null);
    onUploadStart();

    try {
      console.log("Starting file upload process...");
      
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
        console.error("Error creating file record:", fileError);
        throw new Error(`Error creating file record: ${fileError.message}`);
      }
      
      if (!fileRecord) {
        throw new Error("Failed to create file record");
      }

      // Upload the actual file to 'invoice_files' bucket
      console.log(`Uploading file to invoice_files bucket: ${fileRecord.file_path}`);
      const { error: storageError } = await supabase.storage
        .from('invoice_files')
        .upload(fileRecord.file_path, file);

      if (storageError) {
        // Clean up the database entry since the upload failed
        console.error("Storage upload error:", storageError);
        await supabase
          .from("manual_invoice_files")
          .delete()
          .eq("id", fileRecord.id);
        throw new Error(`Error uploading file: ${storageError.message}`);
      }

      setUploadSuccess(true);
      console.log("File upload successful, calling onUploadComplete with ID:", fileRecord.id);
      onUploadComplete(fileRecord.id);
      toast.success("Archivo subido exitosamente");
      
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Error al subir el archivo");
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploadSuccess ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              <span>Archivo subido correctamente</span>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {file ? file.name : "Seleccione un archivo o arrástrelo aquí"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {acceptedTypes.split(',').join(', ')}
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept={acceptedTypes}
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
              >
                Seleccionar Archivo
              </label>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center text-red-600 text-sm">
          <XCircle className="mr-1 h-4 w-4" />
          <span>{uploadError}</span>
        </div>
      )}

      {file && !uploadSuccess && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full"
        >
          {uploading ? "Subiendo..." : "Subir Archivo"}
        </Button>
      )}
    </div>
  );
}
