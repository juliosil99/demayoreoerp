import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Banknote, FileText, ArrowRightLeft } from "lucide-react";
import { AccountTransaction } from "./hooks/transaction-types";

export interface Transaction extends AccountTransaction {
  isInitialBalance?: boolean;
  runningBalance?: number | null;
  beforeInitialDate?: boolean;
}

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  // Format amount with commas and 2 decimal places
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Determine which icon to show based on transaction type
  const getIcon = () => {
    if (transaction.isInitialBalance) {
      return <Banknote className="h-4 w-4 text-gray-500" />;
    }
    
    if (transaction.source === 'transfer') {
      return <ArrowRightLeft className="h-4 w-4 text-purple-500" />;
    }
    
    if (transaction.type === 'in') {
      return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    }
    
    if (transaction.type === 'out') {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
    
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  // Row opacity for transactions before initial date
  const rowOpacity = transaction.beforeInitialDate ? 'opacity-50' : 'opacity-100';

  // Format date string
  const formattedDate = format(new Date(transaction.date), 'dd/MM/yyyy');

  return (
    <TableRow className={rowOpacity}>
      <TableCell className="whitespace-nowrap">
        {formattedDate}
      </TableCell>
      <TableCell className="max-w-[200px] overflow-hidden text-ellipsis">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span title={transaction.description}>
            {transaction.description}
          </span>
        </div>
        
        {/* Show currency exchange information if present */}
        {transaction.exchange_rate && transaction.exchange_rate !== 1 && transaction.original_amount && transaction.original_currency && (
          <div className="text-xs text-gray-500 mt-1">
            Tipo de cambio: {transaction.exchange_rate.toFixed(4)} 
            {transaction.type === 'in' 
              ? ` (${formatAmount(transaction.original_amount)} ${transaction.original_currency})` 
              : ` (${formatAmount(transaction.original_amount)} ${transaction.original_currency})`
            }
          </div>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {transaction.reference}
      </TableCell>
      <TableCell className={`text-right font-medium whitespace-nowrap ${
        transaction.isInitialBalance 
          ? 'text-gray-600' 
          : transaction.type === 'in' 
            ? 'text-green-600' 
            : 'text-red-600'
      }`}>
        {transaction.isInitialBalance ? '' : transaction.type === 'in' ? '+' : '-'}
        ${formatAmount(Math.abs(transaction.amount))}
      </TableCell>
      <TableCell className="text-right font-semibold whitespace-nowrap">
        {transaction.runningBalance !== null
          ? `$${formatAmount(Math.abs(transaction.runningBalance || 0))}`
          : ''}
      </TableCell>
    </TableRow>
  );
}
