
import { Button } from "@/components/ui/button";
import { BanknoteIcon, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BankingHeaderProps {
  onAddAccount: () => void;
}

export function BankingHeader({ onAddAccount }: BankingHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold">Gestión de Cuentas Bancarias</h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate("/accounting/transfers")}
          className="w-full sm:w-auto"
        >
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Transferencias
        </Button>
        <Button 
          className="w-full sm:w-auto"
          onClick={onAddAccount}
        >
          <BanknoteIcon className="mr-2 h-4 w-4" />
          Agregar Cuenta
        </Button>
      </div>
    </div>
  );
}
