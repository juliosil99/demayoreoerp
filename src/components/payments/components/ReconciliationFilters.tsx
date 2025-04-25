
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrdersFileUpload } from "./OrdersFileUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ReconciliationFiltersProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  orderNumbers: string;
  onOrderNumbersChange: (orders: string) => void;
}

export function ReconciliationFilters({
  selectedChannel,
  onChannelChange,
  orderNumbers,
  onOrderNumbersChange,
}: ReconciliationFiltersProps) {
  const handleFileUploadComplete = (orders: string[]) => {
    onOrderNumbersChange(orders.join(","));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="channel">Canal de Venta</Label>
          <Select value={selectedChannel} onValueChange={onChannelChange}>
            <SelectTrigger id="channel">
              <SelectValue placeholder="Seleccionar canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los canales</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Mercado Libre">Mercado Libre</SelectItem>
              <SelectItem value="Shopify">Shopify</SelectItem>
              <SelectItem value="Walmart">Walmart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Números de Orden</Label>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Ingresar números de orden separados por coma"
              value={orderNumbers}
              onChange={(e) => onOrderNumbersChange(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <OrdersFileUpload onOrdersLoaded={handleFileUploadComplete} />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Puedes ingresar los números de orden manualmente separados por coma, o cargar un archivo Excel con los números de orden en la primera columna.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
