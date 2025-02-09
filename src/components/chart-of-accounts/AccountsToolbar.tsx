
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Plus } from "lucide-react";

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
