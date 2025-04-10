
import { useAuth } from "@/contexts/AuthContext";
import { useStatements } from "./hooks/useStatements";
import { useStatementActions } from "./hooks/useStatementActions";
import { StatementsTable } from "./components/StatementsTable";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";

interface BankStatementsListProps {
  accountId: number;
  refreshTrigger?: number;
}

export function BankStatementsList({ accountId, refreshTrigger = 0 }: BankStatementsListProps) {
  const { user } = useAuth();
  const { statements, loading, setStatements } = useStatements(accountId, user?.id, refreshTrigger);
  const { 
    deleteDialogOpen, 
    setDeleteDialogOpen, 
    statementToDelete, 
    confirmDelete, 
    handleDelete, 
    handleDownload 
  } = useStatementActions(statements, setStatements);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando estados de cuenta...</p>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <p className="text-gray-500">No hay estados de cuenta registrados para esta cuenta bancaria</p>
      </div>
    );
  }

  return (
    <>
      <StatementsTable 
        statements={statements} 
        onDelete={confirmDelete} 
        onDownload={handleDownload} 
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        statement={statementToDelete}
        onConfirm={handleDelete}
      />
    </>
  );
}
