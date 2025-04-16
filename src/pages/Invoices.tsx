
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/invoices/FileUploader";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { SatButton } from "@/components/invoices/sat-automation/SatButton";
import { SatJobsList } from "@/components/invoices/sat-automation/SatJobsList";

const Invoices = () => {
  const { data: invoices, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      console.log("Fetching invoices...");
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} invoices`);
      return data;
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Facturas</h1>
        <div className="flex gap-2">
          <FileUploader onUploadSuccess={refetch} />
          <SatButton />
        </div>
      </div>

      <SatJobsList />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable invoices={invoices} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
