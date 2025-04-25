
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SalesSearchProps {
  onSearch: (value: string) => void;
}

export const SalesSearch = ({ onSearch }: SalesSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        type="search"
        placeholder="Buscar por número de orden..."
        className="pl-10"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};
