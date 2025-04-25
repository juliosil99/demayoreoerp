
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { transformSalesRowToDbFormat, validateSalesRow } from "../utils/dataTransformer";
import { FailedImport } from "../types";

export const useSalesImport = (onImportSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [failedImports, setFailedImports] = useState<FailedImport[]>([]);
  const [showFailures, setShowFailures] = useState(false);

  const processFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return utils.sheet_to_json(worksheet) as Record<string, any>[];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    setFailedImports([]);
    setShowFailures(false);
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
        try {
          const salesData = transformSalesRowToDbFormat(row);
          const validation = validateSalesRow(salesData);
          
          if (!validation.valid) {
            newFailedImports.push({
              rowData: row,
              reason: validation.reason,
              rowIndex: index + 2
            });
            errorCount++;
            continue;
          }
          
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
      }
      
      return { successCount, errorCount, shouldClose: errorCount === 0 && successCount > 0 };
    } catch (err) {
      toast({
        title: "Error",
        description: "Ocurrió un error procesando el archivo.",
        variant: "destructive"
      });
      console.error("Error processing sales import:", err);
      return { successCount: 0, errorCount: 0, shouldClose: false };
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return {
    isUploading,
    file,
    failedImports,
    showFailures,
    handleFileChange,
    handleImport
  };
};
