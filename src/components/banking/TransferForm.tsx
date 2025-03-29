
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferFormFields } from "@/components/banking/transfer-form";
import { useAccountTransferCreate } from "@/components/banking/hooks/useAccountTransferCreate";
import { Button } from "@/components/ui/button";
import { AccountCurrency } from "./types";

interface TransferFormProps {
  accounts: Array<{
    id: number;
    name: string;
    balance: number;
    currency: AccountCurrency;
  }>;
}

export function TransferForm({ accounts }: TransferFormProps) {
  const { formData, setFormData, handleSubmit, isPending } = useAccountTransferCreate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Transferencia</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TransferFormFields 
            formData={formData}
            setFormData={setFormData}
            accounts={accounts}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Procesando..." : "Realizar Transferencia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
