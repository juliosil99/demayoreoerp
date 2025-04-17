
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import type { NewBankAccount, BankAccount, AccountCurrency } from "./types";
import { useForm } from "react-hook-form";

interface BankAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: NewBankAccount | BankAccount) => void;
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
  title: string;
  submitText: string;
  chartAccounts: any[];
}

export function BankAccountDialog({
  isOpen,
  onOpenChange,
  onSave,
  account,
  setAccount,
  title,
  submitText,
}: BankAccountDialogProps) {
  const isCreditCard = account.type === "Credit Card";
  const isCredit = account.type === "Credit Simple";
  
  // Selected tab for credit details
  const [selectedTab, setSelectedTab] = React.useState<string>("general");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="general">Información General</TabsTrigger>
            {(isCreditCard || isCredit) && (
              <TabsTrigger value="creditDetails">Detalles de Crédito</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Cuenta</Label>
                <Input
                  id="name"
                  value={account.name}
                  onChange={(e) =>
                    setAccount({ ...account, name: e.target.value })
                  }
                  placeholder="Ingrese el nombre de la cuenta"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Cuenta</Label>
                <Select
                  value={account.type}
                  onValueChange={(value) => {
                    const newAccountType = value as NewBankAccount["type"];
                    // Reset credit-specific fields if changing from credit type
                    if (newAccountType !== "Credit Card" && newAccountType !== "Credit Simple") {
                      setSelectedTab("general");
                    }
                    setAccount({ ...account, type: newAccountType });
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccione el tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank">Banco</SelectItem>
                    <SelectItem value="Cash">Efectivo</SelectItem>
                    <SelectItem value="Credit Card">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="Credit Simple">Crédito Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={account.currency}
                  onValueChange={(value) =>
                    setAccount({ ...account, currency: value as AccountCurrency })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Seleccione la moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                    <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="initial_balance">Saldo Inicial</Label>
                  <Input
                    id="initial_balance"
                    type="number"
                    value={account.initial_balance}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        initial_balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance_date">Fecha del Saldo</Label>
                  <Input
                    id="balance_date"
                    type="date"
                    value={account.balance_date ? account.balance_date.split('T')[0] : ''}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        balance_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Saldo Actual</Label>
                <Input
                  id="balance"
                  type="number"
                  value={account.balance}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </TabsContent>
          
          {(isCreditCard || isCredit) && (
            <TabsContent value="creditDetails" className="space-y-4 pt-4">
              {isCreditCard && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="payment_due_day">Día de Pago</Label>
                      <Input
                        id="payment_due_day"
                        type="number"
                        min="1"
                        max="31"
                        value={account.payment_due_day || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            payment_due_day: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ej. 15"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="statement_cut_day">Día de Corte</Label>
                      <Input
                        id="statement_cut_day"
                        type="number"
                        min="1"
                        max="31"
                        value={account.statement_cut_day || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            statement_cut_day: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ej. 5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="credit_limit">Límite de Crédito</Label>
                      <Input
                        id="credit_limit"
                        type="number"
                        value={account.credit_limit || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            credit_limit: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minimum_payment_percentage">
                        Porcentaje de Pago Mínimo (%)
                      </Label>
                      <Input
                        id="minimum_payment_percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={account.minimum_payment_percentage || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            minimum_payment_percentage: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ej. 10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="interest_rate">Tasa de Interés Anual (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={account.interest_rate || ""}
                      onChange={(e) =>
                        setAccount({
                          ...account,
                          interest_rate: parseFloat(e.target.value) || undefined,
                        })
                      }
                      placeholder="Ej. 36.5"
                    />
                  </div>
                </div>
              )}

              {isCredit && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="original_loan_amount">Monto Original del Préstamo</Label>
                      <Input
                        id="original_loan_amount"
                        type="number"
                        value={account.original_loan_amount || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            original_loan_amount: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="loan_start_date">Fecha de Inicio del Préstamo</Label>
                      <Input
                        id="loan_start_date"
                        type="date"
                        value={account.loan_start_date ? account.loan_start_date.split('T')[0] : ''}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            loan_start_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="monthly_payment">Pago Mensual</Label>
                      <Input
                        id="monthly_payment"
                        type="number"
                        value={account.monthly_payment || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            monthly_payment: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_due_day">Día de Pago Mensual</Label>
                      <Input
                        id="payment_due_day"
                        type="number"
                        min="1" 
                        max="31"
                        value={account.payment_due_day || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            payment_due_day: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ej. 15"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="total_term_months">Plazo Total (Meses)</Label>
                      <Input
                        id="total_term_months"
                        type="number"
                        min="1"
                        value={account.total_term_months || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            total_term_months: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ej. 60"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remaining_months">Meses Restantes</Label>
                      <Input
                        id="remaining_months"
                        type="number"
                        min="0"
                        value={account.remaining_months || ""}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            remaining_months: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ej. 48"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="interest_rate">Tasa de Interés Anual (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={account.interest_rate || ""}
                      onChange={(e) =>
                        setAccount({
                          ...account,
                          interest_rate: parseFloat(e.target.value) || undefined,
                        })
                      }
                      placeholder="Ej. 12.5"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
        
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => onSave(account)}
            className="w-full sm:w-auto"
          >
            {submitText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
