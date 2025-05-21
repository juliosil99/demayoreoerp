
import React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialPeriod } from "@/types/financial-reporting";
import { AccountBalanceTabContent } from "./components/AccountBalanceTabContent";

interface AccountBalanceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  periodId: string;
  period: FinancialPeriod | null;
}

export const AccountBalanceEditor: React.FC<AccountBalanceEditorProps> = ({
  isOpen,
  onClose,
  periodId,
  period
}) => {
  const [activeTab, setActiveTab] = React.useState("assets");
  
  // Check if the period is closed
  const isPeriodClosed = period?.is_closed || false;
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Saldos de Cuentas</DialogTitle>
          <DialogDescription>
            {period ? `Período: ${period.period_type === 'month' ? 'Mes' : 
                      period.period_type === 'quarter' ? 'Trimestre' : 
                      period.period_type === 'year' ? 'Año' : 'Día'} 
                      ${period.period} de ${period.year}` : 'Cargando período...'}
          </DialogDescription>
        </DialogHeader>

        {isPeriodClosed && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md mb-4">
            <p className="text-yellow-800 text-sm">Este período está cerrado. Los saldos no pueden ser modificados.</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="assets">Activos</TabsTrigger>
            <TabsTrigger value="liabilities">Pasivos</TabsTrigger>
            <TabsTrigger value="equity">Capital</TabsTrigger>
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
          </TabsList>
          
          {['assets', 'liabilities', 'equity', 'revenue', 'expenses'].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="h-[400px] overflow-y-auto">
              <AccountBalanceTabContent 
                tabValue={tabValue} 
                periodId={periodId} 
                isPeriodClosed={isPeriodClosed} 
              />
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
