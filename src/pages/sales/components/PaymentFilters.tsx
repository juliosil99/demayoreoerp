
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  salesChannelId: string | undefined;
  setSalesChannelId: (id: string | undefined) => void;
  accountId: string | undefined;
  setAccountId: (id: string | undefined) => void;
  status: string | undefined;
  setStatus: (status: string | undefined) => void;
  bankAccounts: any[];
  salesChannels: any[];
  onResetFilters: () => void;
  onApplyFilters: () => void;
}

export function PaymentFilters({
  dateRange,
  setDateRange,
  salesChannelId,
  setSalesChannelId,
  accountId,
  setAccountId,
  status,
  setStatus,
  bankAccounts,
  salesChannels,
  onResetFilters,
  onApplyFilters
}: PaymentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Count active filters
  const activeFilters = [
    dateRange?.from,
    salesChannelId,
    accountId,
    status
  ].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {activeFilters > 0 && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-white">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Rango de Fechas</Label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
              
              <div className="space-y-2">
                <Label>Canal de Venta</Label>
                <Select value={salesChannelId} onValueChange={(value) => setSalesChannelId(value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los canales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los canales</SelectItem>
                    {salesChannels?.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cuenta Bancaria</Label>
                <Select value={accountId} onValueChange={(value) => setAccountId(value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las cuentas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las cuentas</SelectItem>
                    {bankAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={status} onValueChange={(value) => setStatus(value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onResetFilters}>
                Limpiar Filtros
              </Button>
              <Button onClick={onApplyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
