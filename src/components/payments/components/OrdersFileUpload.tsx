
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { read, utils } from "xlsx";
import { toast } from "sonner";

interface OrdersFileUploadProps {
  onOrdersLoaded: (orders: string[]) => void;
}

export function OrdersFileUpload({ onOrdersLoaded }: OrdersFileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as any[];
      
      // Extract order numbers from the first column
      const orderNumbers = jsonData
        .map(row => Object.values(row)[0]?.toString())
        .filter(Boolean);

      if (orderNumbers.length === 0) {
        toast.error("No se encontraron números de orden en el archivo");
        return;
      }

      onOrdersLoaded(orderNumbers);
      toast.success(`${orderNumbers.length} órdenes cargadas exitosamente`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error al procesar el archivo");
    } finally {
      setIsLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
        id="orders-file-upload"
        disabled={isLoading}
      />
      <label 
        htmlFor="orders-file-upload" 
        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? "Procesando..." : "Cargar archivo de órdenes"}
      </label>
    </div>
  );
}
