
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type Month = { value: string; label: string };

interface MonthYearSelectorProps {
  month: string;
  year: string;
  months: Month[];
  years: string[];
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

export function MonthYearSelector({
  month,
  year,
  months,
  years,
  onMonthChange,
  onYearChange
}: MonthYearSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="month">Mes</Label>
        <Select value={month} onValueChange={onMonthChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el mes" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="year">Año</Label>
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el año" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
