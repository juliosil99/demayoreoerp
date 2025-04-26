
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, FilterX } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

interface ReconciliationFiltersProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  orderNumbers: string;
  onOrderNumbersChange: (orders: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onReset: () => void;
}

export function ReconciliationFilters({
  selectedChannel,
  onChannelChange,
  orderNumbers,
  onOrderNumbersChange,
  dateRange,
  onDateRangeChange,
  onReset,
}: ReconciliationFiltersProps) {
  return (
    <div className="space-y-4 p-4 border rounded-md bg-background">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros de Reconciliación</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <FilterX className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Canal</label>
          <Select value={selectedChannel} onValueChange={onChannelChange}>
            <SelectTrigger>
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Números de Orden</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de orden"
              value={orderNumbers}
              onChange={(e) => onOrderNumbersChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rango de Fechas</label>
          <DatePickerWithRange date={dateRange} setDate={onDateRangeChange} />
        </div>
      </div>
    </div>
  );
}
