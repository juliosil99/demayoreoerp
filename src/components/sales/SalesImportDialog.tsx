
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface SalesImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function SalesImportDialog({ open, onOpenChange, onImportSuccess }: SalesImportDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return utils.sheet_to_json(worksheet);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Seleccione un archivo para importar.");
      return;
    }
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast.error("El archivo debe ser CSV o XLSX.");
      return;
    }

    setIsUploading(true);
    try {
      const salesRows = await processFile(file);
      let successCount = 0, errorCount = 0;
      for (const row of salesRows) {
        const { error } = await supabase
          .from("Sales")
          .insert([{
            // Map fields as needed, you can adapt this mapping to your headers/ERP needs
            date: row.Fecha || row.date || null,
            orderNumber: row["No. Orden"] || row.orderNumber || null,
            productName: row.Producto || row.productName || null,
            idClient: row["ID Cliente"] || row.idClient || null,
            price: row.Monto || row.price || null,
            Profit: row.Ganancia || row.Profit || null,
            statusPaid: row.Estado || row.statusPaid || null,
            // ... agrega aquí otros campos relevantes que tengan tus archivos
          }]);
        if (error) {
          errorCount++;
        } else {
          successCount++;
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} ventas importadas exitosamente.`);
        if (onImportSuccess) onImportSuccess();
        onOpenChange(false);
      }
      if (errorCount > 0) toast.error(`${errorCount} ventas no pudieron importarse.`);
    } catch (err) {
      toast.error("Ocurrió un error procesando el archivo.");
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px]">
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
