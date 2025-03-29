
import { XCircle } from "lucide-react";

interface UploadErrorMessageProps {
  error: string | null;
}

export function UploadErrorMessage({ error }: UploadErrorMessageProps) {
  if (!error) return null;
  
  return (
    <div className="flex items-center text-red-600 text-sm">
      <XCircle className="mr-1 h-4 w-4" />
      <span>{error}</span>
    </div>
  );
}
