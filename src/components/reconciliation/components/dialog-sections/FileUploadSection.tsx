
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
  console.log("[FileUploadSection] Rendering file upload section");
  
  const handleUploadStart = () => {
    console.log("[FileUploadSection] Upload start event received, calling onUploadStart");
    onUploadStart();
  };
  
  const handleUploadComplete = (fileId: string) => {
    console.log("[FileUploadSection] Upload complete event received with fileId:", fileId);
    console.log("[FileUploadSection] Calling onUploadComplete");
    onUploadComplete(fileId);
  };
  
  return (
    <div className="space-y-2">
      <Label>Subir Documento</Label>
      <FileUploader
        onUploadStart={handleUploadStart}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
