import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { BanknoteIcon, CreditCard, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
}

interface Transfer {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export default function Banking() {
  const { user } = useAuth();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showTransfers, setShowTransfers] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "" as AccountType,
    balance: 0,
  });

  console.log("Current user:", user);
  console.log("Show transfers state:", showTransfers);

  const { data: accounts, refetch } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user?.id,
  });

  const { data: transfers, isLoading: transfersLoading, error: transfersError } = useQuery({
    queryKey: ["account-transfers"],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for transfers query");
        return [];
      }

      console.log("Fetching transfers for user:", user.id);
      const { data, error } = await supabase
        .from("account_transfers")
        .select(`
          *,
          from_account:bank_accounts!from_account_id(name),
          to_account:bank_accounts!to_account_id(name)
        `)
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transfers:", error);
        throw error;
      }
      
      console.log("Transfers data:", data);
      return data;
    },
    enabled: showTransfers && !!user?.id,
  });

  console.log("Transfers query state:", { 
    isLoading: transfersLoading, 
    error: transfersError, 
    data: transfers,
    enabled: showTransfers && !!user?.id
  });

  const handleAddAccount = async () => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .insert([newAccount]);

      if (error) throw error;

      toast.success("Cuenta agregada exitosamente");
      setIsAddingAccount(false);
      setNewAccount({ name: "", type: "" as AccountType, balance: 0 });
      refetch();
    } catch (error) {
      console.error("Error agregando cuenta:", error);
      toast.error("Fallo al agregar cuenta");
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;

    try {
      const { error } = await supabase
        .from("bank_accounts")
        .update({
          name: newAccount.name,
          type: newAccount.type,
          balance: newAccount.balance,
        })
        .eq("id", selectedAccount.id);

      if (error) throw error;

      toast.success("Cuenta actualizada exitosamente");
      setIsEditingAccount(false);
      setSelectedAccount(null);
      setNewAccount({ name: "", type: "" as AccountType, balance: 0 });
      refetch();
    } catch (error) {
      console.error("Error actualizando cuenta:", error);
      toast.error("Fallo al actualizar cuenta");
    }
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      toast.success("Cuenta eliminada exitosamente");
      refetch();
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      toast.error("Fallo al eliminar cuenta");
    }
  };

  const openEditDialog = (account: BankAccount) => {
    setSelectedAccount(account);
    setNewAccount({
      name: account.name,
      type: account.type,
      balance: account.balance,
    });
    setIsEditingAccount(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Gestión de Cuentas Bancarias</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTransfers(!showTransfers)}
            className="w-full sm:w-auto"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {showTransfers ? "Ocultar Transferencias" : "Ver Transferencias"}
          </Button>
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <BanknoteIcon className="mr-2 h-4 w-4" />
                Agregar Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Cuenta</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label>Nombre de la Cuenta</label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, name: e.target.value })
                    }
                    placeholder="Ingrese el nombre de la cuenta"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Tipo de Cuenta</label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value) =>
                      setNewAccount({ ...newAccount, type: value as AccountType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank">Banco</SelectItem>
                      <SelectItem value="Cash">Efectivo</SelectItem>
                      <SelectItem value="Credit Card">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="Credit Simple">Crédito Simple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label>Saldo Inicial</label>
                  <Input
                    type="number"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        balance: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingAccount(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddAccount}
                  className="w-full sm:w-auto"
                >
                  Agregar Cuenta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditingAccount} onOpenChange={setIsEditingAccount}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Cuenta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label>Nombre de la Cuenta</label>
                <Input
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                  placeholder="Ingrese el nombre de la cuenta"
                />
              </div>
              <div className="grid gap-2">
                <label>Tipo de Cuenta</label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) =>
                    setNewAccount({ ...newAccount, type: value as AccountType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank">Banco</SelectItem>
                    <SelectItem value="Cash">Efectivo</SelectItem>
                    <SelectItem value="Credit Card">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="Credit Simple">Crédito Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label>Saldo</label>
                <Input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      balance: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsEditingAccount(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleEditAccount}
                className="w-full sm:w-auto"
              >
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Saldo Actual</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {account.type === "Credit Card" ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <BanknoteIcon className="h-4 w-4" />
                    )}
                    {account.type === "Bank" ? "Banco" :
                     account.type === "Cash" ? "Efectivo" :
                     account.type === "Credit Card" ? "Tarjeta de Crédito" :
                     "Crédito Simple"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  ${account.balance.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAccount(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {transfersLoading ? (
        <div className="text-center py-8 text-gray-500">
          Cargando transferencias...
        </div>
      ) : transfersError ? (
        <div className="text-center py-8 text-red-500">
          Error al cargar transferencias: {transfersError.message}
        </div>
      ) : showTransfers && transfers && transfers.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cuenta Origen</TableHead>
                <TableHead>Cuenta Destino</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer: any) => (
                <TableRow key={transfer.id}>
                  <TableCell>{format(new Date(transfer.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{transfer.from_account.name}</TableCell>
                  <TableCell>{transfer.to_account.name}</TableCell>
                  <TableCell className="text-right">${transfer.amount.toFixed(2)}</TableCell>
                  <TableCell>{transfer.reference_number || '-'}</TableCell>
                  <TableCell>{transfer.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : showTransfers && (
        <div className="text-center py-8 text-gray-500">
          No hay transferencias para mostrar
        </div>
      )}
    </div>
  );
}
