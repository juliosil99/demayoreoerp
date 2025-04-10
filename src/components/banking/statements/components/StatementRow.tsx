
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
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getFileIcon(statement.content_type)}
          <span className="truncate max-w-[200px]" title={statement.filename}>
            {statement.filename}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {getMonthName(statement.month)} {statement.year}
      </TableCell>
      <TableCell className="text-center">{formatDate(statement.upload_date)}</TableCell>
      <TableCell className="text-center">{formatFileSize(statement.size)}</TableCell>
      <TableCell>
        <div className="flex justify-end items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDownload(statement)}
            title="Descargar"
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(statement)}
            title="Eliminar"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
