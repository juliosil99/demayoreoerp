import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

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
    toast.info("Add account functionality coming soon");
  };

  const handleEditAccount = (account: Account) => {
    toast.info(`Edit account ${account.name} coming soon`);
  };

  const handleDeleteAccount = (account: Account) => {
    toast.info(`Delete account ${account.name} coming soon`);
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
              onClick={() => handleDeleteAccount(account)}
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
    </div>
  );
}