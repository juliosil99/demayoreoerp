
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BankStatementsTable } from "@/integrations/supabase/types/bank-statements";

type BankStatement = BankStatementsTable['Row'];

export function useStatementActions(statements: BankStatement[], setStatements: React.Dispatch<React.SetStateAction<BankStatement[]>>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<BankStatement | null>(null);

  // Handle download statement
  const handleDownload = async (statement: BankStatement) => {
    try {
      const { data, error } = await supabase.storage
        .from("bank_statements")
        .download(statement.file_path);
      
      if (error) throw error;

      // Create downloadable link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = statement.filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
    } catch (error) {
      toast.error("Error al descargar el archivo");
    }
  };

  // Handle delete statement
  const confirmDelete = (statement: BankStatement) => {
    setStatementToDelete(statement);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!statementToDelete) return;
    
    try {
      // Remove file from storage
      const { error: storageError } = await supabase.storage
        .from("bank_statements")
        .remove([statementToDelete.file_path]);
      
      if (storageError) throw storageError;
      
      // Remove record from database
      const { error: dbError } = await supabase
        .from("bank_statements")
        .delete()
        .eq("id", statementToDelete.id);
      
      if (dbError) throw dbError;
      
      // Update list
      setStatements(statements.filter(s => s.id !== statementToDelete.id));
      toast.success("Estado de cuenta eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el estado de cuenta");
    } finally {
      setDeleteDialogOpen(false);
      setStatementToDelete(null);
    }
  };

  return { 
    deleteDialogOpen, 
    setDeleteDialogOpen, 
    statementToDelete, 
    confirmDelete, 
    handleDelete, 
    handleDownload 
  };
}
