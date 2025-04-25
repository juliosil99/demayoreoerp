
import { useState } from "react";
import { FailedImport } from "../types";
import { validateImportFile } from "../utils/validation";
import { processFile, processImportData } from "../utils/fileProcessor";

export const useSalesImport = (onImportSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [failedImports, setFailedImports] = useState<FailedImport[]>([]);
  const [showFailures, setShowFailures] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCurrentFile(e.target.files[0].name);
    }
    setFailedImports([]);
    setShowFailures(false);
    setProgress(0);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateImportFile(file)) {
      return { successCount: 0, errorCount: 0, shouldClose: false };
    }

    setIsUploading(true);
    setFailedImports([]);
    setShowFailures(false);
    setProgress(0);

    try {
      const salesRows = await processFile(file!);
      let processedRows = 0;
      const totalRows = salesRows.length;

      const result = await processImportData(salesRows, (currentRow) => {
        processedRows = currentRow;
        setProgress(Math.round((processedRows / totalRows) * 100));
      });
      
      setFailedImports(result.failedImports);
      if (result.errorCount > 0) {
        setShowFailures(true);
      }
      if (result.successCount > 0 && onImportSuccess) {
        onImportSuccess();
      }
      
      return result;
    } catch (err) {
      console.error("Error processing sales import:", err);
      return { successCount: 0, errorCount: 0, shouldClose: false };
    } finally {
      setIsUploading(false);
      setFile(null);
      setProgress(0);
      setCurrentFile("");
    }
  };

  return {
    isUploading,
    file,
    failedImports,
    showFailures,
    progress,
    currentFile,
    handleFileChange,
    handleImport
  };
};
