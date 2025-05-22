
import { useState } from "react";
import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type PaymentFilter = {
  search: string;
  date?: Date;
  paymentMethod: "all" | "cash" | "transfer" | "credit_card" | "check";
  isReconciled: boolean | "all";
};

interface PaymentFiltersProps {
  filters: PaymentFilter;
  onChangeFilters: (filters: PaymentFilter) => void;
  onToggleReconciled: (value: boolean | "all") => void;
}

export function PaymentFilters({
  filters,
  onChangeFilters,
  onToggleReconciled,
}: PaymentFiltersProps) {
  const [date, setDate] = useState<Date | undefined>(filters.date);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    onChangeFilters({
      ...filters,
      date,
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    onChangeFilters({
      ...filters,
      paymentMethod: value as PaymentFilter["paymentMethod"],
    });
  };

  const handleReconciledChange = (value: string) => {
    const reconciledValue = 
      value === "all" ? "all" : 
      value === "true" ? true : 
      false;
    
    onToggleReconciled(reconciledValue);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pagos..."
          className="pl-8"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.paymentMethod}
          onValueChange={handlePaymentMethodChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Método de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
              <SelectItem value="check">Cheque</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.isReconciled === "all"
              ? "all"
              : filters.isReconciled === true
              ? "true"
              : "false"
          }
          onValueChange={handleReconciledChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado de reconciliación" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Reconciliados</SelectItem>
              <SelectItem value="false">No reconciliados</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
