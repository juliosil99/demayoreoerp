import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesSearch } from "@/components/sales/components/SalesSearch";

interface ReceivablesFiltersProps {
  searchTerm: string;
  startDate: string;
  endDate: string;
  selectedChannel: string;
  uniqueChannels: string[];
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onChannelChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ReceivablesFilters({
  searchTerm,
  startDate,
  endDate,
  selectedChannel,
  uniqueChannels,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onChannelChange,
  onClearFilters,
}: ReceivablesFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpiar Filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <SalesSearch 
              onSearch={onSearchChange}
              placeholder="Buscar por orden, producto, canal, SKU..."
            />
          </div>
          <div>
            <Label htmlFor="startDate">Fecha Desde</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Fecha Hasta</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="channel">Canal</Label>
            <Select value={selectedChannel} onValueChange={onChannelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                {uniqueChannels.map(channel => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}