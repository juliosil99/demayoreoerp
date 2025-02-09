import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2, Download, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";

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
    enabled: !!user, // Only run query if user is authenticated
  });

  const handleExportAccounts = () => {
    if (!accounts) return;

    // Create CSV content
    const headers = ['Code', 'Name', 'Type', 'Level', 'SAT Code', 'Account Use'];
    const csvContent = [
      headers.join(','),
      ...accounts.map(account => [
        account.code,
        `"${account.name}"`,
        account.account_type,
        account.level,
        account.sat_code || '',
        account.account_use || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'chart_of_accounts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Chart of accounts exported successfully');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];

      // Validate CSV structure
      if (!headers.includes('Code') || !headers.includes('Name') || !headers.includes('Type')) {
        toast.error("Invalid CSV format. Please use the correct template");
        return;
      }

      const codeIndex = headers.indexOf('Code');
      const nameIndex = headers.indexOf('Name');
      const typeIndex = headers.indexOf('Type');
      const levelIndex = headers.indexOf('Level');
      const satCodeIndex = headers.indexOf('SAT Code');
      const accountUseIndex = headers.indexOf('Account Use');

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue; // Skip empty rows

        const { data, error } = await supabase
          .from('chart_of_accounts')
          .insert({
            code: row[codeIndex]?.trim(),
            name: row[nameIndex]?.trim().replace(/^"|"$/g, ''), // Remove quotes if present
            account_type: row[typeIndex]?.trim(),
            level: row[levelIndex] ? parseInt(row[levelIndex]) : 1,
            sat_code: satCodeIndex >= 0 ? row[satCodeIndex]?.trim() : null,
            account_use: accountUseIndex >= 0 ? row[accountUseIndex]?.trim() : null,
            user_id: user.id,
          });

        if (error) {
          console.error("Error importing row:", error);
          toast.error(`Error importing account ${row[codeIndex]}: ${error.message}`);
        }
      }

      toast.success("Accounts imported successfully");
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Error processing CSV file");
    }

    // Reset file input
    event.target.value = '';
  };

  const handleExportTemplate = () => {
    const headers = ['Code', 'Name', 'Type', 'Level', 'SAT Code', 'Account Use'];
    const csvContent = headers.join(',') + '\n';
    const exampleRow = ['1000', 'Example Account', 'Assets', '1', 'SAT123', 'G01'].join(',');
    const template = csvContent + exampleRow;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'chart_of_accounts_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Template downloaded successfully');
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

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const rootAccounts = accounts?.filter(account => !account.parent_id) || [];
  const parentAccounts = accounts?.map(({ id, code, name }) => ({ id, code, name })) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button onClick={() => document.getElementById('csv-upload')?.click()} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button onClick={handleExportAccounts} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
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
