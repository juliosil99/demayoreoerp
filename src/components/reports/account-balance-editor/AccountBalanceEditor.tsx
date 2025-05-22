
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
import { PeriodInfoPanel } from "./components/PeriodInfoPanel";

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
            <PeriodInfoPanel period={period} isPeriodClosed={isPeriodClosed} />
          </DialogDescription>
        </DialogHeader>

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
