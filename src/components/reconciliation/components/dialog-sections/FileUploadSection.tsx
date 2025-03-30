
import { Label } from "@/components/ui/label";
import { FileUploader } from "../uploader/FileUploader";

interface FileUploadSectionProps {
  onUploadStart: () => void;
  onUploadComplete: (fileId: string) => void;
}

export function FileUploadSection({ 
  onUploadStart, 
  onUploadComplete 
}: FileUploadSectionProps) {
  const handleUploadComplete = (fileId: string) => {
    // Call onUploadComplete with a slight delay to prevent race conditions
    setTimeout(() => {
      onUploadComplete(fileId);
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
        />
      </div>
    </div>
  );
}
