
import { Label } from "@/components/ui/label";
import { FileUploader } from "../FileUploader";

interface FileUploadSectionProps {
  onUploadStart: () => void;
  onUploadComplete: (fileId: string) => void;
}

export function FileUploadSection({ 
  onUploadStart, 
  onUploadComplete 
}: FileUploadSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Subir Documento</Label>
      <FileUploader
        onUploadStart={onUploadStart}
        onUploadComplete={onUploadComplete}
      />
    </div>
  );
}
