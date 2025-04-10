
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  disabled: boolean;
  uploading: boolean;
}

export function UploadButton({ disabled, uploading }: UploadButtonProps) {
  return (
    <Button type="submit" disabled={disabled || uploading}>
      <Upload className="mr-2 h-4 w-4" />
      {uploading ? "Subiendo..." : "Subir Estado de Cuenta"}
    </Button>
  );
}
