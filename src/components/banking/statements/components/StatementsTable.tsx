
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
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="font-semibold">Archivo</TableHead>
            <TableHead className="text-center font-semibold">Período</TableHead>
            <TableHead className="text-center font-semibold">Fecha de Subida</TableHead>
            <TableHead className="text-center font-semibold">Tamaño</TableHead>
            <TableHead className="text-right font-semibold pr-6">Acciones</TableHead>
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
    </div>
  );
}
