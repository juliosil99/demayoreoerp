
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferFormFields } from "@/components/banking/TransferFormFields";
import { useAccountTransferCreate } from "@/components/banking/hooks/useAccountTransferCreate";
import { Button } from "@/components/ui/button";

interface TransferFormProps {
  accounts: Array<{
    id: number;
    name: string;
    balance: number;
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
