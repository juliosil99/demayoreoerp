
import React, { useEffect, useState } from "react";
import { DateAmountFields } from "./DateAmountFields";
import { AccountSelect } from "./AccountSelect";
import { ExchangeRateCard } from "./ExchangeRateCard";
import { ReferenceFields } from "./ReferenceFields";
import { InvoiceUpload } from "./InvoiceUpload";
import { Account, TransferFormData } from "./types";

interface TransferFormFieldsProps {
  formData: TransferFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransferFormData>>;
  accounts: Array<Account>;
}

export function TransferFormFields({ 
  formData, 
  setFormData, 
  accounts 
}: TransferFormFieldsProps) {
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);
  const [isCrossCurrency, setIsCrossCurrency] = useState(false);

  // Update selected accounts when account selection changes
  useEffect(() => {
    if (formData.from_account_id) {
      const account = accounts.find(a => a.id.toString() === formData.from_account_id);
      setFromAccount(account || null);
    } else {
      setFromAccount(null);
    }
    
    if (formData.to_account_id) {
      const account = accounts.find(a => a.id.toString() === formData.to_account_id);
      setToAccount(account || null);
    } else {
      setToAccount(null);
    }
  }, [formData.from_account_id, formData.to_account_id, accounts]);

  // Determine if this is a cross-currency transfer
  useEffect(() => {
    if (fromAccount && toAccount) {
      setIsCrossCurrency(fromAccount.currency !== toAccount.currency);
    } else {
      setIsCrossCurrency(false);
    }
  }, [fromAccount, toAccount]);

  // Update the destination amount based on exchange rate
  useEffect(() => {
    if (isCrossCurrency && formData.amount_from && formData.exchange_rate) {
      const sourceAmount = parseFloat(formData.amount_from);
      const rate = parseFloat(formData.exchange_rate);
      
      if (!isNaN(sourceAmount) && !isNaN(rate) && rate > 0) {
        const destAmount = (sourceAmount * rate).toFixed(2);
        setFormData(prev => ({
          ...prev,
          amount_to: destAmount
        }));
      }
    } else if (!isCrossCurrency && formData.amount_from) {
      // Same currency, amounts are equal
      setFormData(prev => ({
        ...prev,
        amount_to: formData.amount_from,
        exchange_rate: "1"
      }));
    }
  }, [formData.amount_from, formData.exchange_rate, isCrossCurrency, setFormData]);

  return (
    <>
      <DateAmountFields formData={formData} setFormData={setFormData} />

      <div className="grid grid-cols-2 gap-4">
        <AccountSelect 
          formData={formData} 
          setFormData={setFormData} 
          accounts={accounts} 
          isFromAccount={true} 
        />
        <AccountSelect 
          formData={formData} 
          setFormData={setFormData} 
          accounts={accounts} 
          isFromAccount={false} 
        />
      </div>

      <ExchangeRateCard 
        formData={formData}
        setFormData={setFormData}
        fromAccount={fromAccount}
        toAccount={toAccount}
        isCrossCurrency={isCrossCurrency}
      />

      <ReferenceFields formData={formData} setFormData={setFormData} />
      
      <InvoiceUpload formData={formData} setFormData={setFormData} />
    </>
  );
}
