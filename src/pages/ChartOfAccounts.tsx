import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function ChartOfAccounts() {
  const { user } = useAuth();
  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);

  const handleAddAccount = () => {
    // TODO: Implement add account functionality
    toast.info("Add account functionality coming soon");
  };

  const handleInitialBalance = () => {
    // TODO: Implement initial balance functionality
    toast.info("Initial balance functionality coming soon");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
        <div className="space-x-4">
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
          <Button variant="outline" onClick={handleInitialBalance}>
            Capturar Saldos Iniciales
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <p className="text-muted-foreground">
            No hay cuentas registradas. Comience agregando una nueva cuenta.
          </p>
        </div>
      </div>
    </div>
  );
}