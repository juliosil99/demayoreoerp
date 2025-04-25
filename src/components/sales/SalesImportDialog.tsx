
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { downloadSalesExcelTemplate, downloadFailedImports } from "@/components/sales/utils/salesTemplateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { transformSalesRowToDbFormat, validateSalesRow } from "@/components/sales/utils/dataTransformer";
import { SalesBase } from "@/integrations/supabase/types/sales";

interface SalesImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

interface SalesRowData {
  [key: string]: any;
}

interface FailedImport {
  rowData: Record<string, any>;
  reason: string;
  rowIndex: number;
}

export function SalesImportDialog({ isOpen, onOpenChange, onImportSuccess }: SalesImportDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [failedImports, setFailedImports] = useState<FailedImport[]>([]);
  const [showFailures, setShowFailures] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    setFailedImports([]);
    setShowFailures(false);
  };

  const processFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return utils.sheet_to_json(worksheet) as SalesRowData[];
  };

  const handleDownloadTemplate = () => {
    downloadSalesExcelTemplate();
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Seleccione un archivo para importar.",
        variant: "destructive"
      });
      return;
    }
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast({
        title: "Error",
        description: "El archivo debe ser CSV o XLSX.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setFailedImports([]);
    setShowFailures(false);

    try {
      const salesRows = await processFile(file);
      let successCount = 0, errorCount = 0;
      const newFailedImports: FailedImport[] = [];

      for (let index = 0; index < salesRows.length; index++) {
        const row = salesRows[index];
        console.log("Processing row:", row); // Debug log
        
        try {
          // Transform the row data to match the database schema
          const salesData: Partial<SalesBase> = transformSalesRowToDbFormat(row);
          
          // Validate the transformed data
          const validation = validateSalesRow(salesData);
          
          if (!validation.valid) {
            newFailedImports.push({
              rowData: row,
              reason: validation.reason,
              rowIndex: index + 2 // +2 because Excel is 1-indexed and has headers
            });
            errorCount++;
            continue;
          }
          
          // Insert the validated data into Supabase
          const { error } = await supabase.from("Sales").insert(salesData);
            
          if (error) {
            newFailedImports.push({
              rowData: row,
              reason: `Error de base de datos: ${error.message}`,
              rowIndex: index + 2
            });
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          newFailedImports.push({
            rowData: row,
            reason: `Error al procesar: ${err instanceof Error ? err.message : 'Desconocido'}`,
            rowIndex: index + 2
          });
          errorCount++;
        }
      }
      
      setFailedImports(newFailedImports);
      
      if (successCount > 0) {
        toast({
          title: "Importación Exitosa",
          description: `${successCount} ventas importadas exitosamente.`,
        });
        if (onImportSuccess) onImportSuccess();
      }
      
      if (errorCount > 0) {
        setShowFailures(true);
        toast({
          title: "Error",
          description: `${errorCount} ventas no pudieron importarse.`,
          variant: "destructive"
        });
      } else if (successCount > 0) {
        // Close dialog only if everything was successful
        onOpenChange(false);
      }
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Ocurrió un error procesando el archivo.",
        variant: "destructive"
      });
      console.error("Error processing sales import:", err);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleDownloadFailedImports = () => {
    if (failedImports.length > 0) {
      downloadFailedImports(failedImports);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Ventas</DialogTitle>
          <DialogDescription>
            Selecciona un archivo con el detalle de ventas para importar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleImport} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Usar plantilla:</span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadTemplate}
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
            onChange={handleFileChange}
            required
          />
          
          {showFailures && failedImports.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                <div className="text-sm mb-2">
                  No se pudieron importar {failedImports.length} registros.
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadFailedImports}
                  className="w-full flex items-center justify-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar detalle de errores
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isUploading} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Importando..." : "Importar Ventas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
