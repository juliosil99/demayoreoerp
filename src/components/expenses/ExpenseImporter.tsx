import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExpenseQueries, BankAccount, ChartAccount, Supplier } from "./hooks/useExpenseQueries";
import { createExcelTemplate, processExpenseFile } from "./utils/excelUtils";
import { importExpenses } from "./services/expenseImportService";
import type { BankAccountsTable } from "@/integrations/supabase/types/bank-accounts";

interface ExpenseImporterProps {
  onSuccess: () => void;
}

export function ExpenseImporter({ onSuccess }: ExpenseImporterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { bankAccounts, chartAccounts, suppliers } = useExpenseQueries();

  const downloadTemplate = async () => {
    createExcelTemplate(
      bankAccounts as BankAccountsTable["Row"][], 
      chartAccounts as any, 
      suppliers as any
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0 || !user?.id) return;

      const file = files[0];
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast.error('Por favor sube un archivo CSV o XLSX');
        return;
      }

      setIsUploading(true);
      const expenses = await processExpenseFile(file);
      
      const { successCount, errorCount } = await importExpenses(
        expenses,
        user.id,
        file.name,
        () => {} // You could add progress handling here if needed
      );

      if (successCount > 0) {
        toast.success(`${successCount} gastos importados exitosamente`);
        onSuccess();
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} gastos no pudieron ser importados`);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar Gastos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Gastos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Sube un archivo CSV o XLSX con los siguientes encabezados:
            </p>
            <Button variant="outline" onClick={downloadTemplate} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>Fecha (Formato: YYYY-MM-DD)</li>
            <li>Descripción</li>
            <li>Monto</li>
            <li>ID Cuenta</li>
            <li>ID Cuenta Contable</li>
            <li>Método de Pago</li>
            <li>Número de Referencia</li>
            <li>Notas</li>
            <li>ID Proveedor</li>
            <li>Categoría</li>
          </ul>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
