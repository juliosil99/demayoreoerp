
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onManualReconciliation: () => void;
}

export function SearchBar({ searchTerm, onSearchChange, onManualReconciliation }: SearchBarProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por emisor o monto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button variant="outline" onClick={onManualReconciliation} className="whitespace-nowrap">
        <FileText className="h-4 w-4 mr-2" />
        Reconciliación Manual
      </Button>
    </div>
  );
}
