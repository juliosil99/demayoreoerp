import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { parseXMLContent } from "@/utils/xml-parser";
import { processInvoiceFile } from "@/utils/invoice-processor";

export const FileUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.includes("xml")) {
          errorCount++;
          continue;
        }

        try {
          const xmlContent = await file.text();
          const result = await processInvoiceFile(file, xmlContent);
          
          if (result.isDuplicate) {
            duplicateCount++;
          } else if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} invoice(s)`);
        onUploadSuccess();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} file(s)`);
      }

      if (duplicateCount > 0) {
        toast.warning(`Skipped ${duplicateCount} duplicate invoice(s)`);
      }

    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading and processing files");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        accept=".xml"
        onChange={handleFileUpload}
        multiple
        disabled={uploading}
        className="max-w-xs"
      />
      <Button disabled={uploading}>
        {uploading ? (
          "Uploading..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload XML
          </>
        )}
      </Button>
    </div>
  );
};