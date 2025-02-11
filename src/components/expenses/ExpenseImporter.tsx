
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { read, utils, writeFile } from "xlsx";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExpenseImporterProps {
  onSuccess: () => void;
}

export function ExpenseImporter({ onSuccess }: ExpenseImporterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const downloadTemplate = () => {
    const headers = [
      'Fecha',
      'Descripción',
      'Monto',
      'ID Cuenta',
      'ID Cuenta Contable',
      'Método de Pago',
      'Número de Referencia',
      'Notas',
      'ID Proveedor',
      'Categoría'
    ];

    const exampleData = [
      {
        'Fecha': format(new Date(), 'yyyy-MM-dd'),
        'Descripción': 'Ejemplo de Gasto',
        'Monto': '1000.00',
        'ID Cuenta': '1',
        'ID Cuenta Contable': 'UUID-de-la-cuenta',
        'Método de Pago': 'cash',
        'Número de Referencia': 'REF123',
        'Notas': 'Ejemplo de notas',
        'ID Proveedor': 'UUID-del-proveedor',
        'Categoría': 'Servicios'
      }
    ];

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(exampleData, { header: headers });
    utils.book_append_sheet(wb, ws, "Template");
    writeFile(wb, "plantilla_gastos.xlsx");
    toast.success("Plantilla descargada exitosamente");
  };

  const processFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    return jsonData.map((row: any) => ({
      date: row.Fecha || row.date || format(new Date(), 'yyyy-MM-dd'),
      description: row.Descripción || row.description || "",
      amount: row.Monto || row.amount || 0,
      account_id: row["ID Cuenta"] || row.account_id || "",
      chart_account_id: row["ID Cuenta Contable"] || row.chart_account_id || "",
      payment_method: (row["Método de Pago"] || row.payment_method || "cash").toLowerCase(),
      reference_number: row["Número de Referencia"] || row.reference_number || "",
      notes: row.Notas || row.notes || "",
      supplier_id: row["ID Proveedor"] || row.supplier_id || "",
      category: row.Categoría || row.category || "",
    }));
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
      const expenses = await processFile(file);
      
      let successCount = 0;
      let errorCount = 0;

      // Create import record
      const { data: importRecord, error: importError } = await supabase
        .from('expense_imports')
        .insert({
          filename: file.name,
          user_id: user.id,
          total_rows: expenses.length
        })
        .select()
        .single();

      if (importError) {
        toast.error('Error al registrar la importación');
        return;
      }

      for (const expenseData of expenses) {
        try {
          const { error } = await supabase
            .from('expenses')
            .insert({
              ...expenseData,
              user_id: user.id,
              amount: parseFloat(expenseData.amount.toString()),
              account_id: parseInt(expenseData.account_id.toString())
            });

          if (error) {
            console.error('Error importing expense:', error);
            errorCount++;
          } else {
            successCount++;
            
            // Update import record progress
            await supabase
              .from('expense_imports')
              .update({ 
                processed_rows: successCount,
                status: successCount === expenses.length ? 'completed' : 'processing'
              })
              .eq('id', importRecord.id);
          }
        } catch (error) {
          console.error('Error processing expense:', error);
          errorCount++;
        }
      }

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
