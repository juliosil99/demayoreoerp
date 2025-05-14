
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { ProductSearchResult } from "@/types/product-search";
import { formatCurrency } from "@/utils/formatters";

interface ProductSearchResultsProps {
  products: ProductSearchResult[];
  isLoading: boolean;
  downloadXml: (invoiceId: number) => Promise<void>;
  generatePdf: (invoiceId: number, issuerRfc: string) => Promise<void>;
}

export const ProductSearchResults = ({
  products,
  isLoading,
  downloadXml,
  generatePdf,
}: ProductSearchResultsProps) => {
  const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);
  const [downloadingXml, setDownloadingXml] = useState<number | null>(null);
  
  const handleDownloadXml = async (invoiceId: number) => {
    try {
      setDownloadingXml(invoiceId);
      await downloadXml(invoiceId);
    } finally {
      setDownloadingXml(null);
    }
  };

  const handleGeneratePdf = async (invoiceId: number, issuerRfc: string) => {
    try {
      console.log(`Generating PDF for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);
      setGeneratingPdf(invoiceId);
      await generatePdf(invoiceId, issuerRfc);
    } finally {
      setGeneratingPdf(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio Unitario</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>No. Factura</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Emisor</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.description}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>{formatCurrency(product.unit_value)}</TableCell>
              <TableCell>{formatCurrency(product.amount || 0)}</TableCell>
              <TableCell>
                {product.invoice?.invoice_number || 'N/A'}
                {product.invoice?.serie && ` - ${product.invoice.serie}`}
              </TableCell>
              <TableCell>
                {product.invoice?.invoice_date ? 
                  new Date(product.invoice.invoice_date).toLocaleDateString() : 
                  'N/A'}
              </TableCell>
              <TableCell>{product.invoice?.issuer_name || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => product.invoice_id && handleDownloadXml(product.invoice_id)}
                    disabled={downloadingXml === product.invoice_id || !product.invoice_id}
                  >
                    {downloadingXml === product.invoice_id ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> XML</>
                    ) : (
                      <><Download className="h-4 w-4 mr-1" /> XML</>
                    )}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => product.invoice_id && product.invoice?.issuer_rfc && 
                      handleGeneratePdf(product.invoice_id, product.invoice.issuer_rfc)}
                    disabled={generatingPdf === product.invoice_id || !product.invoice_id || !product.invoice?.issuer_rfc}
                  >
                    {generatingPdf === product.invoice_id ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> PDF</>
                    ) : (
                      <><FileText className="h-4 w-4 mr-1" /> PDF</>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
