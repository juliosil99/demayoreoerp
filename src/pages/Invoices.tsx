import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileXml } from "lucide-react";
import { toast } from "sonner";

const Invoices = () => {
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check if file is XML
      if (!file.type.includes("xml")) {
        toast.error("Please upload an XML file");
        return;
      }

      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create invoice record
      const { error: dbError } = await supabase.from("Invoices").insert({
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
      });

      if (dbError) throw dbError;

      toast.success("Invoice uploaded successfully");
      refetch();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-xs"
          />
          <Button disabled={uploading}>
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload XML
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileXml className="h-4 w-4" />
                      {invoice.filename}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{invoice.invoice_number || "-"}</TableCell>
                  <TableCell>
                    {invoice.invoice_date
                      ? new Date(invoice.invoice_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {invoice.total_amount
                      ? `$${invoice.total_amount.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>{invoice.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;