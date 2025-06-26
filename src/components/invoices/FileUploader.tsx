
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
      if (!files || files.length === 0) {
        console.log("📄 No files selected for upload");
        return;
      }

      console.log(`📄 Starting upload process for ${files.length} files`);
      setUploading(true);
      setProgress(0);
      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileIndex = i + 1;
        
        console.log(`📄 Processing file ${fileIndex}/${totalFiles}: ${file.name}`);
        console.log(`📄 File details: size=${file.size} bytes, type=${file.type}`);
        
        setCurrentFile(file.name);
        setProgress(Math.round((i / totalFiles) * 100));
        
        // Verificar tipo de archivo
        if (!file.type.includes("xml") && !file.name.toLowerCase().endsWith('.xml')) {
          console.error(`❌ File ${fileIndex} (${file.name}) is not XML: type=${file.type}`);
          errorCount++;
          continue;
        }

        try {
          console.log(`📄 Reading XML content for file ${fileIndex}: ${file.name}`);
          const xmlContent = await file.text();
          console.log(`📄 XML content length for ${file.name}: ${xmlContent.length} characters`);
          
          if (xmlContent.length === 0) {
            console.error(`❌ File ${fileIndex} (${file.name}) has empty content`);
            errorCount++;
            continue;
          }

          console.log(`📄 Processing invoice file ${fileIndex}: ${file.name}`);
          const result = await processInvoiceFile(file, xmlContent);
          
          console.log(`📄 Processing result for ${file.name}:`, {
            success: result.success,
            isDuplicate: result.isDuplicate,
            error: result.error
          });
          
          if (result.isDuplicate) {
            console.warn(`⚠️ File ${fileIndex} (${file.name}) is a duplicate invoice`);
            duplicateCount++;
          } else if (result.success) {
            console.log(`✅ File ${fileIndex} (${file.name}) processed successfully`);
            successCount++;
          } else {
            console.error(`❌ File ${fileIndex} (${file.name}) failed to process:`, result.error);
            errorCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing file ${fileIndex} (${file.name}):`, {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
          });
          errorCount++;
        }
      }

      setProgress(100);
      console.log(`📄 Upload process completed. Results:`, {
        total: totalFiles,
        successful: successCount,
        errors: errorCount,
        duplicates: duplicateCount
      });

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
      console.error("❌ Critical error in file upload process:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
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
