
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface ReconciliationFiltersProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onReset: () => void;
  salesChannels: any[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ReconciliationFilters({
  selectedChannel,
  onChannelChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onReset,
  salesChannels,
  isLoading = false,
  error
}: ReconciliationFiltersProps) {
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Filtros de búsqueda</h3>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reiniciar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block font-medium">Canal</Label>
          <Select 
            value={selectedChannel} 
            onValueChange={onChannelChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading ? "Cargando canales..." : 
                error ? "Error al cargar canales" :
                "Seleccionar canal"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los canales</SelectItem>
              {Array.isArray(salesChannels) && salesChannels.length > 0 ? (
                salesChannels.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </SelectItem>
                ))
              ) : (
                !isLoading && !error && (
                  <SelectItem value="none" disabled>
                    No hay canales disponibles
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-red-600 mt-1">
              Error: {error.message}
            </p>
          )}
        </div>
        
        <div>
          <Label className="mb-2 block font-medium">Método de Pago</Label>
          <Select 
            value={selectedPaymentMethod} 
            onValueChange={onPaymentMethodChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              <SelectItem value="Cash">Efectivo</SelectItem>
              <SelectItem value="CreditCard">Tarjeta de Crédito</SelectItem>
              <SelectItem value="Transfer">Transferencia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
