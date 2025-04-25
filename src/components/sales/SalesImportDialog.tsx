
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { downloadFailedImports } from "@/components/sales/utils/salesTemplateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SalesImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

interface SalesRowData {
  [key: string]: string | number | null;
  Fecha?: string;
  date?: string;
  "No. Orden"?: string;
  orderNumber?: string;
  Producto?: string;
  productName?: string;
  "ID Cliente"?: number;
  idClient?: number;
  Monto?: number;
  price?: number;
  Ganancia?: number;
  Profit?: number;
  Estado?: string;
  statusPaid?: string;
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
          // Basic validation before inserting
          let validationError = '';
          
          if (!row.Fecha && !row.date) validationError = 'Fecha es requerida';
          else if (!row["No. Orden"] && !row.orderNumber) validationError = 'No. Orden es requerido';
          else if ((!row.Monto && row.Monto !== 0) && (!row.price && row.price !== 0)) validationError = 'Monto es requerido';
          
          if (validationError) {
            newFailedImports.push({
              rowData: row,
              reason: validationError,
              rowIndex: index + 2 // +2 because Excel is 1-indexed and has headers
            });
            errorCount++;
            continue;
          }
          
          // Map the data to match the Supabase table structure 
          // Fix: Insert each row individually with correct typing
          const { error } = await supabase
            .from("Sales")
            .insert({
              date: row.Fecha || row.date || null,
              orderNumber: row["No. Orden"] || row.orderNumber || null,
              productName: row.Producto || row.productName || null,
              idClient: typeof row["ID Cliente"] === 'number' ? row["ID Cliente"] : 
                        typeof row.idClient === 'number' ? row.idClient : null,
              price: typeof row.Monto === 'number' ? row.Monto : 
                     typeof row.price === 'number' ? row.price : null,
              Profit: typeof row.Ganancia === 'number' ? row.Ganancia :
                      typeof row.Profit === 'number' ? row.Profit : null,
              statusPaid: row.Estado || row.statusPaid || null,
              sku: row.SKU || row.sku || null,
              Quantity: typeof row.Cantidad === 'number' ? row.Cantidad :
                        typeof row.Quantity === 'number' ? row.Quantity : null,
              Channel: row.Canal || row.Channel || null,
              cost: typeof row.Costo === 'number' ? row.Costo :
                    typeof row.cost === 'number' ? row.cost : null,
              profitMargin: typeof row.Margen === 'number' ? row.Margen :
                            typeof row.profitMargin === 'number' ? row.profitMargin : null,
              comission: typeof row.Comisión === 'number' ? row.Comisión :
                         typeof row.comission === 'number' ? row.comission : null,
              retention: typeof row.Retención === 'number' ? row.Retención :
                         typeof row.retention === 'number' ? row.retention : null,
              shipping: typeof row.Envío === 'number' ? row.Envío :
                        typeof row.shipping === 'number' ? row.shipping : null,
              category: row.Categoria || row.category || null,
              supplierName: row["Nombre Proveedor"] || row.supplierName || null,
              invoice: row.Factura || row.invoice || null,
              invoiceDate: row["Fecha Factura"] || row.invoiceDate || null,
              datePaid: row["Fecha de Pago"] || row.datePaid || null,
              hour: row.Hora || row.hour || null,
              city: row.Ciudad || row.city || null,
              state: row.Estado || row.state || null,
              postalCode: row["Código Postal"] || row.postalCode || null,
            });
            
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
