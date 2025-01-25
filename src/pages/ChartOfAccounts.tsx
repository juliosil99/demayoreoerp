import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountDialog } from "@/components/chart-of-accounts/AccountDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Account {
  id: string;
  code: string;
  name: string;
  account_type: string;
  sat_code: string | null;
  account_use: string | null;
  parent_id: string | null;
  is_group: boolean;
  level: number;
  path: string;
}

export default function ChartOfAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | undefined>();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('path');
      
      if (error) {
        toast.error('Error loading accounts');
        throw error;
      }
      return data as Account[];
    },
  });

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const handleAddAccount = () => {
    setSelectedAccount(undefined);
    setDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', accountToDelete.id);

      if (error) throw error;

      toast.success("Account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account");
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(undefined);
    }
  };

  const confirmDelete = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAccount(undefined);
    queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
  };

  const renderAccount = (account: Account, depth: number = 0) => {
    const hasChildren = accounts?.some(a => a.parent_id === account.id);
    const isExpanded = expandedAccounts.has(account.id);

    return (
      <div key={account.id}>
        <div 
          className={`flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer`}
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(account.id)}
              className="p-1 hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <span className="flex-1">
            <span className="font-medium">{account.code}</span> - {account.name}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditAccount(account)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => confirmDelete(account)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isExpanded &&
          accounts
            ?.filter(a => a.parent_id === account.id)
            .map(child => renderAccount(child, depth + 1))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const rootAccounts = accounts?.filter(account => !account.parent_id) || [];
  const parentAccounts = accounts?.map(({ id, code, name }) => ({ id, code, name })) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
        <Button onClick={handleAddAccount}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      <div className="rounded-lg border">
        {rootAccounts.length > 0 ? (
          <div className="divide-y">
            {rootAccounts.map(account => renderAccount(account))}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-muted-foreground">
              No hay cuentas registradas. Comience agregando una nueva cuenta.
            </p>
          </div>
        )}
      </div>

      <AccountDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        account={selectedAccount}
        parentAccounts={parentAccounts}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta
              {accountToDelete && ` "${accountToDelete.code} - ${accountToDelete.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}