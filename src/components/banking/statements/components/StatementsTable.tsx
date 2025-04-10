
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankStatementsTable } from "@/integrations/supabase/types/bank-statements";
import { StatementRow } from "./StatementRow";

type BankStatement = BankStatementsTable['Row'];

interface StatementsTableProps {
  statements: BankStatement[];
  onDelete: (statement: BankStatement) => void;
  onDownload: (statement: BankStatement) => void;
}

export function StatementsTable({ statements, onDelete, onDownload }: StatementsTableProps) {
  return (
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
          <StatementRow
            key={statement.id}
            statement={statement}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </TableBody>
    </Table>
  );
}
