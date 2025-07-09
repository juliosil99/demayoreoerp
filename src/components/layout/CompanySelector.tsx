import { Building2, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompany } from "@/contexts/CompanyContext";

export function CompanySelector() {
  const { activeCompany, availableCompanies, setActiveCompany, isLoading } = useCompany();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (!activeCompany || availableCompanies.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sin empresa</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium max-w-32 truncate">
            {activeCompany.nombre}
          </span>
          {availableCompanies.length > 1 && (
            <ChevronDown className="h-3 w-3 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      {availableCompanies.length > 1 && (
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Cambiar Empresa</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {availableCompanies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => setActiveCompany(company)}
              className="flex items-center justify-between p-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">{company.nombre}</span>
                <span className="text-xs text-muted-foreground">RFC: {company.rfc}</span>
              </div>
              {activeCompany.id === company.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}