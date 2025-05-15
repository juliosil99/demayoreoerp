
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountBalances } from "@/hooks/financial-reporting/useAccountBalances";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialPeriod } from "@/types/financial-reporting";

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
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assets");
  
  const { 
    balances, 
    isLoading: balancesLoading, 
    saveAccountBalance 
  } = useAccountBalances(periodId);
  
  // State to track account balance inputs
  const [balanceInputs, setBalanceInputs] = useState<{[key: string]: string}>({});
  
  // Load chart of accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('code', { ascending: true });
          
        if (error) throw error;
        
        setAccounts(data || []);
      } catch (err) {
        console.error('Error fetching chart of accounts:', err);
        toast({
          title: "Error",
          description: "No se pudo cargar el catálogo de cuentas.",
          variant: "destructive"
        });
      } finally {
        setAccountsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchAccounts();
    }
  }, [user, isOpen]);
  
  // Initialize balance inputs from balances
  useEffect(() => {
    if (balances) {
      const initialBalances: {[key: string]: string} = {};
      balances.forEach(balance => {
        initialBalances[balance.account_id] = balance.balance.toString();
      });
      setBalanceInputs(initialBalances);
    }
  }, [balances]);
  
  // Handle input change
  const handleInputChange = (accountId: string, value: string) => {
    setBalanceInputs(prev => ({
      ...prev,
      [accountId]: value
    }));
  };
  
  // Handle save balance
  const handleSaveBalance = async (accountId: string) => {
    try {
      const balance = parseFloat(balanceInputs[accountId]);
      if (isNaN(balance)) {
        toast({
          title: "Error",
          description: "El saldo debe ser un número válido.",
          variant: "destructive"
        });
        return;
      }
      
      await saveAccountBalance({
        account_id: accountId,
        period_id: periodId,
        balance
      });
      
      toast({
        title: "Éxito",
        description: "Saldo guardado correctamente.",
      });
    } catch (err) {
      console.error('Error saving balance:', err);
      toast({
        title: "Error",
        description: "No se pudo guardar el saldo.",
        variant: "destructive"
      });
    }
  };
  
  // Filter accounts by type for each tab
  const getFilteredAccounts = (type: string) => {
    if (accountsLoading) return [];
    
    if (type === 'assets') {
      return accounts.filter(acc => 
        acc.account_type === 'asset' || 
        acc.account_type === 'current_asset' || 
        acc.account_type === 'fixed_asset'
      );
    }
    
    if (type === 'liabilities') {
      return accounts.filter(acc => 
        acc.account_type === 'liability' || 
        acc.account_type === 'current_liability' || 
        acc.account_type === 'long_term_liability'
      );
    }
    
    if (type === 'equity') {
      return accounts.filter(acc => acc.account_type === 'equity');
    }
    
    if (type === 'revenue') {
      return accounts.filter(acc => acc.account_type === 'revenue');
    }
    
    if (type === 'expenses') {
      return accounts.filter(acc => acc.account_type === 'expense');
    }
    
    return [];
  };
  
  // Get balance for an account
  const getAccountBalance = (accountId: string) => {
    if (balances) {
      const balance = balances.find(b => b.account_id === accountId);
      return balance?.balance || 0;
    }
    return 0;
  };
  
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
              {accountsLoading || balancesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredAccounts(tabValue).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          No hay cuentas en esta categoría
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredAccounts(tabValue).map(account => (
                        <TableRow key={account.id}>
                          <TableCell>{account.code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              disabled={isPeriodClosed}
                              value={balanceInputs[account.id] || '0'}
                              onChange={e => handleInputChange(account.id, e.target.value)}
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isPeriodClosed}
                              onClick={() => handleSaveBalance(account.id)}
                            >
                              Guardar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
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
