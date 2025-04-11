
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AccountDialog } from "@/components/chart-of-accounts/AccountDialog";
import { useNavigate } from "react-router-dom";
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
import { AccountsToolbar } from "@/components/chart-of-accounts/AccountsToolbar";
import { AccountsList } from "@/components/chart-of-accounts/AccountsList";
import { csvService } from "@/components/chart-of-accounts/services/csvService";
import { useChartOfAccounts } from "@/components/chart-of-accounts/hooks/useChartOfAccounts";
import { useDeleteAccount } from "@/components/chart-of-accounts/hooks/useDeleteAccount";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | undefined>();

  const { data: accounts, isLoading } = useChartOfAccounts(user?.id);
  const deleteAccountMutation = useDeleteAccount(user?.id);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (await csvService.importAccounts(file, user.id)) {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    }

    event.target.value = '';
  };

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
    await deleteAccountMutation.mutateAsync(accountToDelete);
    setDeleteDialogOpen(false);
    setAccountToDelete(undefined);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAccount(undefined);
    queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <div className="p-3 md:p-6">Loading...</div>;
  }

  const parentAccounts = accounts?.map(({ id, code, name }) => ({ id, code, name })) || [];

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      <AccountsToolbar
        onAddAccount={handleAddAccount}
        onExportTemplate={csvService.exportTemplate}
        onExportAccounts={() => accounts && csvService.exportAccounts(accounts)}
        onFileUpload={handleFileUpload}
      />

      <AccountsList
        accounts={accounts || []}
        expandedAccounts={expandedAccounts}
        onToggleExpand={toggleExpand}
        onEditAccount={handleEditAccount}
        onDeleteAccount={(account) => {
          setAccountToDelete(account);
          setDeleteDialogOpen(true);
        }}
      />

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
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
