
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Download, Trash2, FileText, FileIcon } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { BankStatementsTable } from "@/integrations/supabase/types/bank-statements";

type BankStatement = BankStatementsTable['Row'];

interface StatementRowProps {
  statement: BankStatement;
  onDelete: (statement: BankStatement) => void;
  onDownload: (statement: BankStatement) => void;
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};

// Get month name from month number
const getMonthName = (month: number): string => {
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return monthNames[month - 1] || "";
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

export function StatementRow({ statement, onDelete, onDownload }: StatementRowProps) {
  return (
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
          onClick={() => onDownload(statement)}
          title="Descargar"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onDelete(statement)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
