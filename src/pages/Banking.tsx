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
import { BanknoteIcon, CreditCard } from "lucide-react";

type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
}

export default function Banking() {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "" as AccountType,
    balance: 0,
  });

  const { data: accounts, refetch } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Gestión de Cuentas Bancarias</h1>
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

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
