
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { createExcelTemplate } from "../../utils/excelUtils";
import { toast } from "sonner";
import type { BankAccountsTable } from "@/integrations/supabase/types/bank-accounts";

interface TemplateDownloaderProps {
  bankAccounts: BankAccountsTable["Row"][] | any[];
  chartAccounts: any[];
  suppliers: any[];
}

export function TemplateDownloader({ bankAccounts, chartAccounts, suppliers }: TemplateDownloaderProps) {
  const downloadTemplate = async () => {
    try {
      console.log("Downloading template with data:", {
        bankAccounts: bankAccounts?.length,
        chartAccounts: chartAccounts?.length,
        suppliers: suppliers?.length
      });
      
      createExcelTemplate(
        bankAccounts as BankAccountsTable["Row"][], 
        chartAccounts as any, 
        suppliers as any
      );
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error al descargar la plantilla");
    }
  };

  return (
    <Button variant="outline" onClick={downloadTemplate} size="sm">
      <Download className="mr-2 h-4 w-4" />
      Descargar Plantilla
    </Button>
  );
}
