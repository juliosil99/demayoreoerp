
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/invoices/FileUploader";
import { OptimizedInvoiceTable } from "@/components/invoices/OptimizedInvoiceTable";
import { SatButton } from "@/components/invoices/sat-automation/SatButton";
import { SatJobsList } from "@/components/invoices/sat-automation/SatJobsList";

const Invoices = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Facturas</h1>
        <div className="flex gap-2">
          <FileUploader onUploadSuccess={() => {
            // The optimized table will automatically refetch when new invoices are uploaded
            // due to its query key invalidation
          }} />
          <SatButton />
        </div>
      </div>

      <SatJobsList />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <OptimizedInvoiceTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
