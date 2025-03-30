
import { AlertCircle } from "lucide-react";

interface UploadErrorMessageProps {
  error: string | null;
}

export function UploadErrorMessage({ error }: UploadErrorMessageProps) {
  if (!error) return null;
  
  return (
    <div className="text-sm text-red-500 flex items-start gap-1.5 mt-2">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Error al subir el archivo:</p>
        <p className="text-xs break-words">{error}</p>
        {error.includes("bucket") && (
          <p className="text-xs mt-1">Este es un error del sistema. Por favor contacte al soporte técnico.</p>
        )}
      </div>
    </div>
  );
}
