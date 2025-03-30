
import { Label } from "@/components/ui/label";
import { FileUploader } from "../uploader/FileUploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface FileUploadSectionProps {
  onUploadStart: () => void;
  onUploadComplete: (fileId: string) => void;
}

export function FileUploadSection({ 
  onUploadStart, 
  onUploadComplete 
}: FileUploadSectionProps) {
  const [showTips, setShowTips] = useState(false);
  
  const handleUploadError = () => {
    setShowTips(true);
  };
  
  const handleUploadComplete = (fileId: string) => {
    // Call onUploadComplete with a slight delay to prevent race conditions
    setTimeout(() => {
      onUploadComplete(fileId);
      setShowTips(false);
    }, 100);
  };
  
  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <Label>Subir Documento</Label>
      <div 
        onClick={(e) => {
          // Prevent event bubbling to avoid triggering form submission
          e.stopPropagation();
        }}
      >
        <FileUploader
          onUploadStart={onUploadStart}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>
      
      {showTips && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problemas con la carga de archivos</AlertTitle>
          <AlertDescription className="text-xs">
            <p className="mb-1">Si tiene problemas al subir archivos, intente:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Verificar que el archivo no sea demasiado grande (máx. 5MB)</li>
              <li>Usar un formato de archivo soportado (.pdf, .jpg, .png)</li>
              <li>Refrescar la página e intentar nuevamente</li>
              <li>Verificar su conexión a internet</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
