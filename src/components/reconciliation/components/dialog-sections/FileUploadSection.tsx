
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
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
}
