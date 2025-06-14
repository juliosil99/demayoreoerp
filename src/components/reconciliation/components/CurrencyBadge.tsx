
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CurrencyBadgeProps {
  currency: string;
  amount?: number;
  convertedAmount?: number;
  convertedCurrency?: string;
  exchangeRate?: number;
  showConversion?: boolean;
}

export function CurrencyBadge({ 
  currency, 
  amount, 
  convertedAmount, 
  convertedCurrency, 
  exchangeRate,
  showConversion = false 
}: CurrencyBadgeProps) {
  const isUSD = currency === 'USD';
  
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isUSD ? "secondary" : "outline"} 
        className={`${isUSD ? 'bg-blue-100 text-blue-800' : ''}`}
      >
        <CircleDollarSign className="h-3 w-3 mr-1" />
        {currency}
      </Badge>
      
      {showConversion && convertedAmount && convertedCurrency && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Info className="h-3 w-3 mr-1" />
                Convertido
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p>Original: {currency} {amount?.toLocaleString()}</p>
                <p>Convertido: {convertedCurrency} {convertedAmount?.toLocaleString()}</p>
                {exchangeRate && <p>Tipo de cambio: {exchangeRate}</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
