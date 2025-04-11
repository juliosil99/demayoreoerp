
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Plus, Menu } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface AccountsToolbarProps {
  onAddAccount: () => void;
  onExportTemplate: () => void;
  onExportAccounts: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AccountsToolbar({
  onAddAccount,
  onExportTemplate,
  onExportAccounts,
  onFileUpload,
}: AccountsToolbarProps) {
  const isMobile = useIsMobile();

  // For mobile devices use dropdown menu
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Catálogo de Cuentas</h1>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".csv"
              onChange={onFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button onClick={onAddAccount} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('csv-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportAccounts}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
      <div className="flex gap-2">
        <Button onClick={onExportTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
        <Input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <Button onClick={() => document.getElementById('csv-upload')?.click()} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar CSV
        </Button>
        <Button onClick={onExportAccounts} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button onClick={onAddAccount}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>
    </div>
  );
}
