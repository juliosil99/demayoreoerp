
import { Button } from "@/components/ui/button";
import { Upload, Filter } from "lucide-react";
import { OptimizedSalesSearch } from "./OptimizedSalesSearch";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SalesHeaderProps {
  onImportClick: () => void;
  onSearch: (value: string) => void;
  onNegativeProfitFilter: (enabled: boolean) => void;
  showingNegativeProfit: boolean;
}

export const SalesHeader = ({ 
  onImportClick, 
  onSearch, 
  onNegativeProfitFilter,
  showingNegativeProfit 
}: SalesHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold">Ventas</h1>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-2">
          <Switch
            id="negative-profit"
            checked={showingNegativeProfit}
            onCheckedChange={onNegativeProfitFilter}
          />
          <Label htmlFor="negative-profit" className="text-sm">
            <Filter className="h-4 w-4 inline mr-1" />
            Solo ganancias negativas
          </Label>
        </div>
        
        <div className="w-full sm:w-64">
          <OptimizedSalesSearch onSearch={onSearch} />
        </div>
        
        <Button onClick={onImportClick}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Ventas
        </Button>
      </div>
    </div>
  );
};
