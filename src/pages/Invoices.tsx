import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/invoices/FileUploader";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";

const Invoices = () => {
  const { data: invoices, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <FileUploader onUploadSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable invoices={invoices} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;