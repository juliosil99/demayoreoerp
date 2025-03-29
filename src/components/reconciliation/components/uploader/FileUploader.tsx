
import { useFileUpload } from "../../hooks/useFileUpload";
import { UploadDropzone } from "./UploadDropzone";
import { UploadErrorMessage } from "./UploadErrorMessage";
import { UploadButton } from "./UploadButton";

interface FileUploaderProps {
  onUploadStart: () => void;
  onUploadComplete: (fileId: string) => void;
  acceptedTypes?: string;
}

export function FileUploader({ 
  onUploadStart, 
  onUploadComplete,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png" 
}: FileUploaderProps) {
  const {
    file,
    uploading,
    uploadError,
    uploadSuccess,
    handleFileChange,
    handleUpload
  } = useFileUpload({
    onUploadStart,
    onUploadComplete
  });

  return (
    <div className="space-y-2">
      <UploadDropzone
        file={file}
        uploadSuccess={uploadSuccess}
        acceptedTypes={acceptedTypes}
        uploading={uploading}
        onFileChange={handleFileChange}
      />

      <UploadErrorMessage error={uploadError} />

      <UploadButton
        file={file}
        uploadSuccess={uploadSuccess}
        uploading={uploading}
        onUpload={handleUpload}
      />
    </div>
  );
}
