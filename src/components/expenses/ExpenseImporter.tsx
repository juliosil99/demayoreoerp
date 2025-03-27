
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { processExpenseFile } from "./utils/excelUtils";
import { importExpenses } from "./services/expenseImportService";
import { ImportProgressBar } from "./components/importer/ImportProgressBar";
import { ImportErrorDisplay } from "./components/importer/ImportErrorDisplay";
import { TemplateDownloader } from "./components/importer/TemplateDownloader";
import { FileUploadForm } from "./components/importer/FileUploadForm";

interface ExpenseImporterProps {
  onSuccess: () => void;
}

export function ExpenseImporter({ onSuccess }: ExpenseImporterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const { user } = useAuth();
  const { bankAccounts, chartAccounts, suppliers } = useExpenseQueries();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0 || !user?.id) {
        console.log("No files selected or user not logged in");
        return;
      }

      const file = files[0];
      console.log("File selected:", file.name, "Type:", file.type, "Size:", file.size);
      
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast.error('Por favor sube un archivo CSV o XLSX');
        console.error("Invalid file type:", file.type);
        return;
      }

      setIsUploading(true);
      setErrors([]);
      setShowErrors(false);
      
      console.log("Processing file...");
      const expenses = await processExpenseFile(file);
      console.log(`Processed ${expenses.length} expenses from file`);
      
      if (expenses.length === 0) {
        setIsUploading(false);
        toast.error('No se encontraron datos en el archivo');
        console.error("No data found in file");
        return;
      }
      
      setTotalExpenses(expenses.length);
      
      const { successCount, errorCount, errors: importErrors } = await importExpenses(
        expenses,
        user.id,
        file.name,
        (count) => {
          const progressPercent = Math.round((count / expenses.length) * 100);
          setProgress(progressPercent);
          console.log(`Import progress: ${progressPercent}%`);
        }
      );

      if (successCount > 0) {
        toast.success(`${successCount} gastos importados exitosamente`);
        onSuccess();
      }
      
      if (errorCount > 0) {
        setErrors(importErrors || []);
        setShowErrors(true);
        toast.error(`${errorCount} gastos no pudieron ser importados`);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsUploading(false);
      setProgress(0);
      setTotalExpenses(0);
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Gastos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Sube un archivo CSV o XLSX con los siguientes encabezados:
            </p>
            <TemplateDownloader 
              bankAccounts={bankAccounts} 
              chartAccounts={chartAccounts} 
              suppliers={suppliers}
            />
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
          
          <ImportProgressBar 
            progress={progress} 
            totalExpenses={totalExpenses} 
            isUploading={isUploading}
          />
          
          <ImportErrorDisplay 
            errors={errors} 
            showErrors={showErrors} 
          />
          
          <FileUploadForm 
            isUploading={isUploading} 
            onFileSelect={handleFileUpload} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
