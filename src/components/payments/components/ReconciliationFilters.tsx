
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReconciliationFiltersProps {
  selectedChannel: string;
  onChannelChange: (value: string) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
}

export function ReconciliationFilters({
  selectedChannel,
  onChannelChange,
  dateRange,
  onDateRangeChange,
}: ReconciliationFiltersProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div>
        <Label>Canal</Label>
        <Select
          value={selectedChannel}
          onValueChange={onChannelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="mercadolibre">Mercado Libre</SelectItem>
            <SelectItem value="walmart">Walmart</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Desde</Label>
        <Input
          type="date"
          value={dateRange.from}
          onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
        />
      </div>
      <div>
        <Label>Hasta</Label>
        <Input
          type="date"
          value={dateRange.to}
          onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
        />
      </div>
    </div>
  );
}
