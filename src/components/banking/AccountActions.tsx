
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, BanknoteIcon, Calendar, FileText, Pencil, Trash2, FileBarChart } from "lucide-react";
import type { BankAccount } from "./types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface AccountActionsProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onManageStatements: (account: BankAccount) => void;
}

export function AccountActions({ account, onEdit, onDelete, onManageStatements }: AccountActionsProps) {
  const navigate = useNavigate();
  const isCredit = account.type === "Credit Card" || account.type === "Credit Simple";
  const canShowCalendar = isCredit;

  const actions = [
    {
      key: "movements",
      label: "Ver movimientos",
      icon: FileBarChart,
      onClick: () => navigate(`/accounting/banking/account/${account.id}`),
      show: true
    },
    {
      key: "calendar",
      label: "Ver calendario de pagos",
      icon: Calendar,
      onClick: () => canShowCalendar ? navigate(`/accounting/banking/payment-schedule/${account.id}`) : undefined,
      show: true,
      disabled: !canShowCalendar
    },
    {
      key: "statements",
      label: "Estados de cuenta",
      icon: FileText,
      onClick: () => onManageStatements(account),
      show: true
    },
    {
      key: "edit",
      label: "Editar cuenta",
      icon: Pencil,
      onClick: () => onEdit(account),
      show: true
    },
    {
      key: "delete",
      label: "Eliminar cuenta",
      icon: Trash2,
      onClick: () => onDelete(account),
      show: true
    }
  ];

  return (
    <div className="flex justify-end gap-1 flex-wrap items-center">
      <TooltipProvider>
        {actions.map(({ key, label, icon: Icon, onClick, show, disabled }) =>
          show ? (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClick}
                  className="h-8 w-8 p-0"
                  disabled={!!disabled}
                  data-testid={`${key}-button-${account.id}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ) : null
        )}
      </TooltipProvider>
    </div>
  );
}
