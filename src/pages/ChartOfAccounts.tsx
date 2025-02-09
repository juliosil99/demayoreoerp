
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/login");
    }
  }, [user, navigate]);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('path');
      
      if (error) {
        toast.error('Error loading accounts');
        throw error;
      }
      return data as Account[];
    },
    enabled: !!user,
  });

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
    if (!accountToDelete || !user) return;

    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', accountToDelete.id)
        .eq('user_id', user.id);

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

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAccount(undefined);
    queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const parentAccounts = accounts?.map(({ id, code, name }) => ({ id, code, name })) || [];

  return (
    <div className="space-y-6 p-6">
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
