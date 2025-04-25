
import { useState } from "react";
import { FailedImport } from "../types";
import { validateImportFile } from "../utils/validation";
import { processFile, processImportData } from "../utils/fileProcessor";

export const useSalesImport = (onImportSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [failedImports, setFailedImports] = useState<FailedImport[]>([]);
  const [showFailures, setShowFailures] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    setFailedImports([]);
    setShowFailures(false);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateImportFile(file)) {
      return { successCount: 0, errorCount: 0, shouldClose: false };
    }

    setIsUploading(true);
    setFailedImports([]);
    setShowFailures(false);

    try {
      const salesRows = await processFile(file!);
      const result = await processImportData(salesRows);
      
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
