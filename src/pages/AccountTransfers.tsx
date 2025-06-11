
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TransferEditDialog } from "@/components/banking/TransferEditDialog";
import { TransferForm } from "@/components/banking/TransferForm";
import { TransfersList } from "@/components/banking/TransfersList";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { useAccountTransfersList } from "@/components/banking/hooks/useAccountTransfersList";
import { useUserCompany } from "@/hooks/useUserCompany";
import { AccountTransfersTable } from "@/integrations/supabase/types/account-transfers";
import { Account } from "@/components/banking/transfer-form/types";

// Define a type for the transfer with joined account information
interface TransferWithAccounts {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount_from: number;
  amount_to: number;
  reference_number: string | null;
  notes: string | null;
  user_id: string;
  status: string;
  company_id: string;
  created_at?: string;
  from_account?: { name: string };
  to_account?: { name: string };
}

export default function AccountTransfers() {
  const navigate = useNavigate();
  const { accounts } = useBankAccounts();
  const { transfers, isLoadingTransfers } = useAccountTransfersList();
  const { data: userCompany } = useUserCompany();
  
  const [selectedTransfer, setSelectedTransfer] = useState<AccountTransfersTable["Row"] | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleBack = () => {
    navigate("/accounting/banking");
  };

  const handleEditTransfer = (transfer: TransferWithAccounts) => {
    // Extract just the base transfer properties without the joined account data
    const baseTransfer: AccountTransfersTable["Row"] = {
      id: transfer.id,
      date: transfer.date,
      from_account_id: transfer.from_account_id,
      to_account_id: transfer.to_account_id,
      amount_from: transfer.amount_from,
      amount_to: transfer.amount_to,
      exchange_rate: null, // Will be filled in by the edit form
      reference_number: transfer.reference_number,
      notes: transfer.notes,
      user_id: transfer.user_id,
      status: transfer.status,
      company_id: transfer.company_id || userCompany?.id || "",
      created_at: transfer.created_at
    };
    
    setSelectedTransfer(baseTransfer);
    setEditDialogOpen(true);
  };

  // Convert bank accounts to the Account type needed by the transfer components
  const formattedAccounts: Account[] = accounts?.map(account => ({
    id: account.id,
    name: account.name,
    balance: account.balance || 0,
    currency: account.currency as "MXN" | "USD"
  })) || [];

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Volver a Cuentas Bancarias
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TransferForm accounts={formattedAccounts} />
        <TransfersList 
          transfers={transfers} 
          isLoading={isLoadingTransfers}
          onEditTransfer={handleEditTransfer} 
        />
      </div>

      {/* Edit Transfer Dialog */}
      {selectedTransfer && (
        <TransferEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          transfer={selectedTransfer}
          accounts={formattedAccounts}
        />
      )}
    </div>
  );
}
