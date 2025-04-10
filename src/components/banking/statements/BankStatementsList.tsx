
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Trash2, FileIcon, FileText } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { BankStatementsTable } from "@/integrations/supabase/types";

// Define the BankStatement type based on the table row type
type BankStatement = BankStatementsTable['Row'];

interface BankStatementsListProps {
  accountId: number;
  refreshTrigger?: number;
}

export function BankStatementsList({ accountId, refreshTrigger = 0 }: BankStatementsListProps) {
  const { user } = useAuth();
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<BankStatement | null>(null);

  // Get month name from month number
  const getMonthName = (month: number): string => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[month - 1] || "";
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Get icon based on content type
  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("csv")) {
      return <FileText className="h-4 w-4 text-green-500" />;
    } else if (contentType.includes("word") || contentType.includes("document")) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (contentType.includes("image")) {
      return <FileText className="h-4 w-4 text-purple-500" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  // Fetch bank statements
  useEffect(() => {
    const fetchStatements = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bank_statements")
          .select("*")
          .eq("account_id", accountId)
          .eq("user_id", user.id)
          .order("year", { ascending: false })
          .order("month", { ascending: false });
        
        if (error) throw error;
        setStatements(data as BankStatement[] || []);
      } catch (error) {
        toast.error("Error al cargar los estados de cuenta");
        setStatements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [accountId, user?.id, refreshTrigger]);

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando estados de cuenta...</p>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <p>No hay estados de cuenta registrados para esta cuenta bancaria</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Archivo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Fecha de Subida</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statements.map((statement) => (
            <TableRow key={statement.id}>
              <TableCell className="font-medium flex items-center gap-2">
                {getFileIcon(statement.content_type)}
                <span className="truncate max-w-[200px]" title={statement.filename}>
                  {statement.filename}
                </span>
              </TableCell>
              <TableCell>
                {getMonthName(statement.month)} {statement.year}
              </TableCell>
              <TableCell>{formatDate(statement.upload_date)}</TableCell>
              <TableCell>{formatFileSize(statement.size)}</TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleDownload(statement)}
                  title="Descargar"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => confirmDelete(statement)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el estado de cuenta 
              {statementToDelete && (
                <span className="font-medium">
                  {" "}{getMonthName(statementToDelete.month)} {statementToDelete.year}
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
