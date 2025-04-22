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
import { formatDate } from "@/utils/formatters";
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
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [statementsDialogOpen, setStatementsDialogOpen] = useState(false);

  const handleViewMovements = (accountId: number) => {
    console.log("Viewing movements for account:", accountId);
    navigate(`/accounting/banking/account/${accountId}`);
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
            <TableHead className="text-right">Saldo Inicial</TableHead>
            <TableHead className="text-right">Fecha Inicial</TableHead>
            <TableHead className="text-right">Saldo Actual</TableHead>
            <TableHead className="text-right">Información de Pago</TableHead>
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
                {formatCurrency(account.initial_balance)}
              </TableCell>
              <TableCell className="text-right">
                {formatDate(account.balance_date)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(account.balance)}
              </TableCell>
              <TableCell className="text-right">
                {renderCreditInfo(account)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewMovements(account.id)}
                    title="Ver movimientos"
                    data-testid={`view-movements-${account.type}`}
                  >
                    <FileBarChart className="h-4 w-4" />
                  </Button>
                  
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
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleManageStatements(account)}
                    title="Estados de cuenta"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(account)}
                    title="Editar cuenta"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(account)}
                    title="Eliminar cuenta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
