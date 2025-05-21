
import React from "react";
import { useAccountTypeData } from "../hooks/useAccountTypeData";
import { AccountBalanceTable } from "./AccountBalanceTable";
import { AccountsLoadingState } from "./AccountsLoadingState";

interface AccountBalanceTabContentProps {
  tabValue: string;
  periodId: string;
  isPeriodClosed: boolean;
}

export const AccountBalanceTabContent: React.FC<AccountBalanceTabContentProps> = ({
  tabValue,
  periodId,
  isPeriodClosed
}) => {
  const { 
    accounts, 
    balances, 
    balanceInputs, 
    handleInputChange, 
    handleSaveBalance,
    accountsLoading,
    balancesLoading
  } = useAccountTypeData(tabValue, periodId);
  
  if (accountsLoading || balancesLoading) {
    return <AccountsLoadingState />;
  }
  
  return (
    <AccountBalanceTable
      accounts={accounts}
      balanceInputs={balanceInputs}
      handleInputChange={handleInputChange}
      handleSaveBalance={handleSaveBalance}
      isPeriodClosed={isPeriodClosed}
    />
  );
};
