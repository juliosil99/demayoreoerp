
import { BanknoteIcon, CreditCard, Pencil, Trash2, FileBarChart, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import type { BankAccount } from "./types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BankStatementsDialog } from "./statements/BankStatementsDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BankAccountsTableProps {
  accounts: BankAccount[];
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

export function BankAccountsTable({ accounts, onEdit, onDelete }: BankAccountsTableProps) {
  console.log('BankAccountsTable rendering with accounts:', accounts);
  
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [statementsDialogOpen, setStatementsDialogOpen] = useState(false);

  const handleViewMovements = (accountId: number, accountType: string) => {
    console.log('handleViewMovements called with:', { accountId, accountType });
    const path = `/accounting/banking/account/${accountId}`;
    console.log('Navigating to path:', path);
    navigate(path);
  };

  const handleManageStatements = (account: BankAccount) => {
    setSelectedAccount(account);
    setStatementsDialogOpen(true);
  };

  const renderCreditInfo = (account: BankAccount) => {
    if (account.type === "Credit Card") {
      return (
        <div className="text-xs text-muted-foreground">
          {account.payment_due_day && (
            <div>
              <span className="font-medium">Pago: </span>
              <span>Día {account.payment_due_day}</span>
            </div>
          )}
          {account.statement_cut_day && (
            <div>
              <span className="font-medium">Corte: </span>
              <span>Día {account.statement_cut_day}</span>
            </div>
          )}
        </div>
      );
    } else if (account.type === "Credit Simple") {
      return (
        <div className="text-xs text-muted-foreground">
          {account.payment_due_day && account.monthly_payment && (
            <div>
              <span className="font-medium">Pago: </span>
              <span>{formatCurrency(account.monthly_payment)} el día {account.payment_due_day}</span>
            </div>
          )}
          {account.remaining_months !== undefined && (
            <div>
              <span className="font-medium">Restante: </span>
              <span>{account.remaining_months} meses</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la Cuenta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Saldo Actual</TableHead>
            <TableHead className="text-right">Información de Pago</TableHead>
            <TableHead className="text-right w-[200px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts?.map((account) => {
            console.log('Rendering account row:', { id: account.id, type: account.type, name: account.name });
            
            return (
              <TableRow key={account.id} data-testid={`account-row-${account.id}`}>
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
                  {formatCurrency(account.balance)}
                </TableCell>
                <TableCell className="text-right">
                  {renderCreditInfo(account)}
                </TableCell>
                <TableCell className="flex justify-end gap-1 p-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMovements(account.id, account.type)}
                          data-testid={`view-movements-button-${account.id}`}
                        >
                          <FileBarChart className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver movimientos</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {(account.type === "Credit Card" || account.type === "Credit Simple") && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/accounting/banking/payment-schedule/${account.id}`)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver calendario de pagos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleManageStatements(account)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Estados de cuenta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar cuenta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(account)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar cuenta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedAccount && (
        <BankStatementsDialog
          open={statementsDialogOpen}
          onOpenChange={setStatementsDialogOpen}
          accountId={selectedAccount.id}
          accountName={selectedAccount.name}
        />
      )}
    </div>
  );
}
