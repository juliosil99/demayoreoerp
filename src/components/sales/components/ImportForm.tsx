
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Download, Upload } from "lucide-react";
import { ImportFormProps } from "../types";
import { downloadSalesExcelTemplate } from "../utils/salesTemplateUtils";
import { UploadProgress } from "./UploadProgress";

export const ImportForm = ({ 
  isUploading, 
  file, 
  onFileChange, 
  onSubmit,
  progress = 0,
  currentFile = ""
}: ImportFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Usar plantilla:</span>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={downloadSalesExcelTemplate}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar plantilla
        </Button>
      </div>
      
      <Input
        type="file"
        accept=".csv,.xlsx"
        disabled={isUploading}
        onChange={onFileChange}
        required
      />
      
      <UploadProgress progress={progress} currentFile={currentFile} />
      
      <DialogFooter>
        <Button type="button" variant="outline" disabled={isUploading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isUploading || !file}>
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Importando..." : "Importar Ventas"}
        </Button>
      </DialogFooter>
    </form>
  );
};
