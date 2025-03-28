
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TransferEditDialog } from "@/components/banking/TransferEditDialog";
import { TransferForm } from "@/components/banking/TransferForm";
import { TransfersList } from "@/components/banking/TransfersList";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { useAccountTransfersList } from "@/components/banking/hooks/useAccountTransfersList";

export default function AccountTransfers() {
  const navigate = useNavigate();
  const { accounts } = useBankAccounts();
  const { transfers, isLoadingTransfers } = useAccountTransfersList();
  
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleBack = () => {
    navigate("/accounting/banking");
  };

  const handleEditTransfer = (transfer) => {
    setSelectedTransfer(transfer);
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
