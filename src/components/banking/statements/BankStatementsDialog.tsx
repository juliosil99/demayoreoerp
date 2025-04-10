
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankStatementUploader } from "./BankStatementUploader";
import { BankStatementsList } from "./BankStatementsList";

interface BankStatementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  accountName: string;
}

export function BankStatementsDialog({
  open,
  onOpenChange,
  accountId,
  accountName
}: BankStatementsDialogProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleUploadSuccess = () => {
    setActiveTab("list");
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Estados de Cuenta - {accountName}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="list">Estados de Cuenta</TabsTrigger>
            <TabsTrigger value="upload">Subir Estado de Cuenta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <BankStatementsList 
              accountId={accountId} 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <BankStatementUploader 
              accountId={accountId} 
              onSuccess={handleUploadSuccess} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
