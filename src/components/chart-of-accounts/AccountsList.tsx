
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";

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

interface AccountsListProps {
  accounts: Account[];
  expandedAccounts: Set<string>;
  onToggleExpand: (accountId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

export function AccountsList({
  accounts,
  expandedAccounts,
  onToggleExpand,
  onEditAccount,
  onDeleteAccount,
}: AccountsListProps) {
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
              onClick={() => onToggleExpand(account.id)}
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
              onClick={() => onEditAccount(account)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteAccount(account)}
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

  const rootAccounts = accounts?.filter(account => !account.parent_id) || [];

  return (
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
  );
}
