
import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  file: File | null;
  uploadSuccess: boolean;
  uploading: boolean;
  onUpload: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export function UploadButton({
  file,
  uploadSuccess,
  uploading,
  onUpload
}: UploadButtonProps) {
  if (!file || uploadSuccess) return null;
  
  return (
    <Button 
      onClick={onUpload} 
      disabled={uploading}
      className="w-full"
      type="button" // Explicitly set type to button to prevent form submission
    >
      {uploading ? "Subiendo..." : "Subir Archivo"}
    </Button>
  );
}
