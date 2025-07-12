import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, X, Download } from "lucide-react";
import { validateInvoiceFile, downloadTransferInvoice } from "../utils/transferInvoiceUtils";
import { FormFieldProps } from "./types";
import { InvoiceSelector } from "./InvoiceSelector";

export function InvoiceUpload({ formData, setFormData }: FormFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateInvoiceFile(file)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      invoice_file: file,
      invoice_filename: file.name,
      // Clear selected invoice when uploading a file
      selected_invoice_id: undefined,
    }));
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      invoice_file: undefined,
      invoice_filename: undefined
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadExisting = () => {
    if (formData.invoice_file_path) {
      downloadTransferInvoice(formData.invoice_file_path);
    }
  };

  const hasFile = formData.invoice_file || formData.invoice_filename;
  const hasSelectedInvoice = formData.selected_invoice_id;
  const isExistingFile = formData.invoice_file_path && formData.invoice_filename && !formData.invoice_file;

  // Auto-switch tabs based on what's selected
  React.useEffect(() => {
    if (hasSelectedInvoice && activeTab === "upload") {
      setActiveTab("select");
    } else if (hasFile && activeTab === "select") {
      setActiveTab("upload");
    }
  }, [hasSelectedInvoice, hasFile, activeTab]);

  return (
    <div className="space-y-4">
      <Label>Comprobante Fiscal (Opcional)</Label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="select">Seleccionar Factura</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-2">
          {!hasFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Arrastra un archivo PDF o XML aquí, o haz clic para seleccionar
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar Archivo
              </Button>
              <Input
                ref={fileInputRef}
                id="invoice-upload"
                type="file"
                accept=".pdf,.xml"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{formData.invoice_filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {isExistingFile ? 'Archivo existente' : 'Archivo nuevo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isExistingFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadExisting}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Formatos permitidos: PDF, XML (máximo 10MB)
          </p>
        </TabsContent>
        
        <TabsContent value="select" className="space-y-2">
          <InvoiceSelector formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}