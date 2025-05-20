
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseFormData } from "./types";

export function useFormHandlers(
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>,
  setAccountCurrency: React.Dispatch<React.SetStateAction<string>>
) {
  // Function to set the chart account ID directly
  const setChartAccountId = (chartAccountId: string) => {
    setFormData(prev => ({
      ...prev,
      chart_account_id: chartAccountId
    }));
  };

  // Function to handle return toggle
  const handleReturnToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isReturn: checked
    }));
  };

  // Function to handle account selection and fetch its currency
  const handleAccountChange = async (accountId: string) => {
    if (!accountId) {
      setAccountCurrency("MXN");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('currency')
        .eq('id', parseInt(accountId))
        .single();
      
      if (!error && data) {
        setAccountCurrency(data.currency);
        setFormData(prev => ({
          ...prev,
          account_id: accountId,
          currency: data.currency,
        }));
      }
    } catch (error) {
      console.error("Error fetching account currency:", error);
    }
  };

  // Function to handle currency change
  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, currency };
      
      // Only reset exchange rate to 1 if we're switching to MXN and the account is also in MXN
      if (currency === "MXN" && prev.currency !== "MXN") {
        newFormData.exchange_rate = "1";
      }
      
      // Recalculate amounts if needed
      const originalAmount = parseFloat(newFormData.original_amount || "0");
      const exchangeRate = parseFloat(newFormData.exchange_rate || "1");
      
      if (originalAmount && exchangeRate) {
        if (currency !== "MXN") {
          // Convert to MXN
          newFormData.amount = (originalAmount * exchangeRate).toString();
        } else {
          // For MXN, original and converted amounts are the same
          newFormData.amount = newFormData.original_amount;
        }
      }
      
      return newFormData;
    });
  };

  // Function to handle exchange rate change
  const handleExchangeRateChange = (exchange_rate: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, exchange_rate };
      
      // Recalculate the MXN amount based on the new exchange rate
      const originalAmount = parseFloat(newFormData.original_amount || "0");
      const newExchangeRate = parseFloat(exchange_rate || "1");
      
      if (originalAmount && newExchangeRate && newFormData.currency !== "MXN") {
        // Convert to MXN
        newFormData.amount = (originalAmount * newExchangeRate).toString();
      }
      
      return newFormData;
    });
  };

  // Function to handle original amount change
  const handleOriginalAmountChange = (original_amount: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, original_amount };
      
      // Recalculate the MXN amount based on the exchange rate
      const newOriginalAmount = parseFloat(original_amount || "0");
      const exchangeRate = parseFloat(newFormData.exchange_rate || "1");
      
      if (newFormData.currency === "MXN") {
        // For MXN, the amount and original_amount are the same
        newFormData.amount = original_amount;
      } else if (newOriginalAmount && exchangeRate) {
        // Convert to MXN
        newFormData.amount = (newOriginalAmount * exchangeRate).toString();
      }
      
      return newFormData;
    });
  };

  return {
    setChartAccountId,
    handleReturnToggle,
    handleAccountChange,
    handleCurrencyChange,
    handleExchangeRateChange,
    handleOriginalAmountChange,
  };
}
