
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Pencil, Trash2, MoreHorizontal, Globe, Badge } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

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
  is_global: boolean;
  user_id: string | null;
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
  const isMobile = useIsMobile();

  const renderAccount = (account: Account, depth: number = 0) => {
    const hasChildren = accounts?.some(a => a.parent_id === account.id);
    const isExpanded = expandedAccounts.has(account.id);

    return (
      <div key={account.id}>
        <div 
          className={`flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-accent rounded-lg cursor-pointer`}
          style={{ paddingLeft: `${depth * (isMobile ? 16 : 24) + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => onToggleExpand(account.id)}
              className="p-1 hover:bg-accent rounded"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 md:w-6" />}
          <div className="flex items-center gap-2 flex-1 truncate text-sm">
            <span className="font-medium">{account.code}</span> - 
            <span className="hidden sm:inline">{account.name}</span>
            <span className="sm:hidden">{account.name.length > 15 ? account.name.substring(0, 15) + '...' : account.name}</span>
            {account.is_global && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">Global</span>
              </div>
            )}
          </div>
          
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!account.is_global ? (
                  <>
                    <DropdownMenuItem onClick={() => onEditAccount(account)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteAccount(account)} className="text-red-600">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>
                    <Globe className="h-3.5 w-3.5 mr-2 text-blue-500" />
                    Cuenta global (no editable)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-1 md:gap-2">
              {!account.is_global ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEditAccount(account)}
                  >
                    <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDeleteAccount(account)}
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-xs text-muted-foreground px-2">
                  Solo lectura
                </div>
              )}
            </div>
          )}
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
          <p className="text-muted-foreground text-sm">
            No hay cuentas registradas. Comience agregando una nueva cuenta.
          </p>
        </div>
      )}
    </div>
  );
}
