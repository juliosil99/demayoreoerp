
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { processInvoiceFile } from "@/utils/invoice-processor";

export const FileUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      setProgress(0);
      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        setProgress(Math.round((i / totalFiles) * 100));
        
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

      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setCurrentFile("");
      }, 1000);

      if (successCount > 0) {
        toast.success(`${successCount} factura(s) procesada(s) exitosamente`);
        onUploadSuccess();
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} archivo(s) no pudieron ser procesados`);
      }

      if (duplicateCount > 0) {
        toast.warning(`${duplicateCount} factura(s) duplicada(s) omitida(s)`);
      }

    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error al subir y procesar archivos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
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
            "Subiendo..."
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir XML
            </>
          )}
        </Button>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Procesando: {currentFile}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-[300px]" />
        </div>
      )}
    </div>
  );
};
