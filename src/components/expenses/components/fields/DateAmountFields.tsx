
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { ExpenseFormData } from "../../hooks/useExpenseForm";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface DateAmountFieldsProps {
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
  accountCurrency?: string;
  handleCurrencyChange?: (currency: string) => void;
  handleExchangeRateChange?: (exchangeRate: string) => void;
  handleOriginalAmountChange?: (originalAmount: string) => void;
  handleReturnToggle?: (checked: boolean) => void;
}

export function DateAmountFields({ 
  formData, 
  setFormData,
  accountCurrency = "MXN",
  handleCurrencyChange,
  handleExchangeRateChange,
  handleOriginalAmountChange,
  handleReturnToggle
}: DateAmountFieldsProps) {
  // Calculate MXN amount when currency, exchange rate, or original amount changes
  useEffect(() => {
    if (!formData.original_amount || !formData.exchange_rate) return;
    
    const originalAmount = parseFloat(formData.original_amount);
    const exchangeRate = parseFloat(formData.exchange_rate);
    
    if (isNaN(originalAmount) || isNaN(exchangeRate)) return;
    
    let mxnAmount: string;
    
    if (formData.currency === "MXN") {
      mxnAmount = formData.original_amount;
    } else {
      mxnAmount = (originalAmount * exchangeRate).toFixed(2);
    }
    
    // Make sure we pass the complete formData object with just the amount property updated
    setFormData({
      ...formData,
      amount: mxnAmount
    });
  }, [formData.original_amount, formData.exchange_rate, formData.currency, setFormData]);

  // Check if exchange rate field should be shown
  const shouldShowExchangeRate = () => {
    // Show when currencies don't match OR when neither currency is MXN
    return formData.currency !== accountCurrency || 
           (formData.currency !== "MXN" && accountCurrency !== "MXN");
  };

  // Determine if this is a return based on isReturn flag
  const isReturn = formData.isReturn;

  // Handle return toggle
  const toggleReturn = (checked: boolean) => {
    if (handleReturnToggle) {
      handleReturnToggle(checked);
    } else {
      setFormData({ ...formData, isReturn: checked });
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="original_amount">Monto</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="return-toggle" className="text-sm text-muted-foreground">
              Reembolso
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Activar para registrar un reembolso o devolución</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Switch
              id="return-toggle"
              checked={isReturn}
              onCheckedChange={toggleReturn}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              id="original_amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.original_amount}
              onChange={(e) => {
                if (handleOriginalAmountChange) {
                  handleOriginalAmountChange(e.target.value);
                } else {
                  setFormData({ ...formData, original_amount: e.target.value });
                }
              }}
              required
              className={`flex-grow ${isReturn ? "border-red-300 text-red-600" : ""}`}
            />
            <Select 
              value={formData.currency} 
              onValueChange={(value) => {
                if (handleCurrencyChange) {
                  handleCurrencyChange(value);
                } else {
                  setFormData({ ...formData, currency: value });
                }
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="MXN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shouldShowExchangeRate() && (
            <div className="flex space-x-2 items-center">
              <Label htmlFor="exchange_rate" className="whitespace-nowrap text-xs">
                Tipo de cambio:
              </Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.0001"
                placeholder="1"
                value={formData.exchange_rate}
                onChange={(e) => {
                  if (handleExchangeRateChange) {
                    handleExchangeRateChange(e.target.value);
                  } else {
                    setFormData({ ...formData, exchange_rate: e.target.value });
                  }
                }}
                className="flex-grow"
              />
            </div>
          )}

          {formData.currency !== "MXN" && parseFloat(formData.original_amount) > 0 && (
            <div className="text-xs text-muted-foreground">
              Equivalente: MXN ${parseFloat(formData.amount).toFixed(2)} 
              {isReturn && <span className="text-red-600"> (reembolso)</span>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
