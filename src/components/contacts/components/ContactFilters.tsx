
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  typeFilter: "all" | "client" | "supplier" | "employee";
  setTypeFilter: (value: "all" | "client" | "supplier" | "employee") => void;
}

export const ContactFilters = ({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
}: ContactFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, RFC o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={typeFilter}
          onValueChange={(value: "all" | "client" | "supplier" | "employee") => setTypeFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="client">Clientes</SelectItem>
            <SelectItem value="supplier">Proveedores</SelectItem>
            <SelectItem value="employee">Empleados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
