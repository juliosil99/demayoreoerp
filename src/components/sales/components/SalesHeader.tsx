
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { downloadSalesExcelTemplate } from "@/components/sales/utils/salesTemplateUtils";
import { SalesSearch } from "./SalesSearch";

interface SalesHeaderProps {
  onImportClick: () => void;
  onSearch: (value: string) => void;
}

export const SalesHeader = ({ onImportClick, onSearch }: SalesHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Resumen de Ventas</h1>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={downloadSalesExcelTemplate}
            className="border border-dashed"
          >
            Descargar plantilla
          </Button>
          <Button onClick={onImportClick} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar Ventas
          </Button>
        </div>
      </div>
      <SalesSearch onSearch={onSearch} />
    </div>
  );
};
