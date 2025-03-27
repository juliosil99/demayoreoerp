
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadFormProps {
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadForm({ isUploading, onFileSelect }: FileUploadFormProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={onFileSelect}
        disabled={isUploading}
        className="max-w-xs"
      />
      <Button disabled={isUploading}>
        {isUploading ? (
          "Importando..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </>
        )}
      </Button>
    </div>
  );
}
