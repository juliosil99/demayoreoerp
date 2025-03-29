
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { Upload, File, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadSuccess: (fileId: string) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        setFile(null);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('El archivo es demasiado grande (máximo 5MB)');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/invoices/${fileName}`;
      
      // Insert the file metadata into the database first
      const { data: fileRecord, error: dbError } = await supabase
        .from('manual_invoice_files')
        .insert([
          { 
            filename: file.name,
            file_path: filePath,
            content_type: file.type,
            size: file.size,
            user_id: user.id
          }
        ])
        .select('id')
        .single();
      
      if (dbError) throw dbError;
      
      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      setIsSuccess(true);
      toast.success('Archivo subido correctamente');
      onUploadSuccess(fileRecord.id);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error al subir el archivo');
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Seleccionar PDF
        </Button>
        
        {file && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || isSuccess}
          >
            {isUploading ? 'Subiendo...' : 'Subir'}
          </Button>
        )}
      </div>
      
      {file && (
        <div className="flex items-center text-sm p-2 bg-muted rounded border">
          <File className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{file.name}</span>
          {isSuccess && <Check className="h-4 w-4 ml-2 text-green-500" />}
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
