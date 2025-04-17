
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralInfoTab } from "./GeneralInfoTab";
import { CreditDetailsTab } from "./CreditDetailsTab";
import { NewBankAccount, BankAccount } from "../types";

interface BankAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: NewBankAccount | BankAccount) => void;
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
  title: string;
  submitText: string;
  chartAccounts?: any[];
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
  const [selectedTab, setSelectedTab] = useState<string>("general");

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
            <GeneralInfoTab 
              account={account} 
              setAccount={setAccount} 
              setSelectedTab={setSelectedTab}
            />
          </TabsContent>
          
          {(isCreditCard || isCredit) && (
            <TabsContent value="creditDetails" className="space-y-4 pt-4">
              <CreditDetailsTab 
                account={account} 
                setAccount={setAccount} 
                isCreditCard={isCreditCard}
              />
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
