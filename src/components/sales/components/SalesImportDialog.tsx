
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSalesImport } from "../hooks/useSalesImport";
import { ImportForm } from "./ImportForm";
import { FailureAlert } from "./FailureAlert";
import { downloadFailedImports } from "../utils/salesTemplateUtils";
import { SalesImportDialogProps } from "../types";

export function SalesImportDialog({ isOpen, onOpenChange, onImportSuccess }: SalesImportDialogProps) {
  const {
    isUploading,
    file,
    failedImports,
    showFailures,
    handleFileChange,
    handleImport
  } = useSalesImport(onImportSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleImport(e);
    if (result.shouldClose) {
      onOpenChange(false);
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

        <ImportForm
          isUploading={isUploading}
          file={file}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />

        {showFailures && (
          <FailureAlert
            failedImports={failedImports}
            onDownload={handleDownloadFailedImports}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
