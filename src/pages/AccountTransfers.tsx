
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TransferEditDialog } from "@/components/banking/TransferEditDialog";
import { TransferForm } from "@/components/banking/TransferForm";
import { TransfersList } from "@/components/banking/TransfersList";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { useAccountTransfersList } from "@/components/banking/hooks/useAccountTransfersList";
import { AccountTransfersTable } from "@/integrations/supabase/types/account-transfers";

// Define a type for the transfer with joined account information
interface TransferWithAccounts extends AccountTransfersTable["Row"] {
  from_account?: { name: string };
  to_account?: { name: string };
}

export default function AccountTransfers() {
  const navigate = useNavigate();
  const { accounts } = useBankAccounts();
  const { transfers, isLoadingTransfers } = useAccountTransfersList();
  
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
      amount: transfer.amount,
      reference_number: transfer.reference_number,
      notes: transfer.notes,
      user_id: transfer.user_id,
      status: transfer.status,
      created_at: transfer.created_at
    };
    
    setSelectedTransfer(baseTransfer);
    setEditDialogOpen(true);
  };

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
        <TransferForm accounts={accounts || []} />
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
          accounts={accounts || []}
        />
      )}
    </div>
  );
}
