
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
import { 
  Download, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Info 
} from "lucide-react";
import { ProductSearchResult } from "@/types/product-search";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    } catch (error) {
      console.error("Error in handleGeneratePdf:", error);
    } finally {
      setGeneratingPdf(null);
    }
  };

  // This function determines if PDF generation is possible for a product
  const isPdfGenerationPossible = (product: ProductSearchResult) => {
    // Basic check for invoice ID and issuer RFC
    if (!product.invoice_id || !product.invoice?.issuer_rfc) {
      return { possible: false, reason: "Faltan datos de factura: ID o RFC del emisor" };
    }
    
    return { possible: true };
  };

  // We check missing critical fields to determine if PDF will be complete
  const hasCriticalFields = (product: ProductSearchResult) => {
    if (!product.invoice) return { complete: false, missingFields: ["datos de factura"] };
    
    const missingFields = [];
    
    if (!product.invoice.invoice_number && !product.invoice.serie) {
      missingFields.push("número o serie de factura");
    }
    
    if (!product.invoice.invoice_date && !product.invoice.stamp_date) {
      missingFields.push("fecha");
    }
    
    if (!product.invoice.issuer_name) {
      missingFields.push("emisor");
    }
    
    return { 
      complete: missingFields.length === 0,
      missingFields
    };
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
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 flex items-start gap-2">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Información sobre generación de PDFs</p>
          <p className="text-sm">
            Todos los documentos pueden generar un PDF aunque algunos pueden tener datos incompletos. 
            Los PDFs se generarán con los datos disponibles en el sistema.
          </p>
        </div>
      </div>
      
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
            {products.map((product) => {
              const pdfStatus = isPdfGenerationPossible(product);
              const fieldsStatus = hasCriticalFields(product);
              
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.description}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{formatCurrency(product.unit_value || 0)}</TableCell>
                  <TableCell>{formatCurrency(product.amount || 0)}</TableCell>
                  <TableCell>
                    {product.invoice?.invoice_number || 'N/A'}
                    {product.invoice?.serie && ` - ${product.invoice.serie}`}
                  </TableCell>
                  <TableCell>
                    {product.invoice?.invoice_date ? 
                      new Date(product.invoice.invoice_date).toLocaleDateString() : 
                      product.invoice?.stamp_date ?
                      new Date(product.invoice.stamp_date).toLocaleDateString() + " (timbrado)" :
                      'N/A'}
                  </TableCell>
                  <TableCell>{product.invoice?.issuer_name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          {!product.invoice_id && (
                            <TooltipContent>
                              <p>No se puede descargar XML: Falta ID de factura</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button 
                                size="sm"
                                onClick={() => pdfStatus.possible && product.invoice_id && product.invoice?.issuer_rfc && 
                                  handleGeneratePdf(product.invoice_id, product.invoice.issuer_rfc)}
                                disabled={generatingPdf === product.invoice_id || !pdfStatus.possible}
                                variant={pdfStatus.possible ? 
                                  (fieldsStatus.complete ? "default" : "secondary") : 
                                  "outline"}
                              >
                                {generatingPdf === product.invoice_id ? (
                                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> PDF</>
                                ) : pdfStatus.possible ? (
                                  fieldsStatus.complete ? (
                                    <><FileText className="h-4 w-4 mr-1" /> PDF</>
                                  ) : (
                                    <><Info className="h-4 w-4 mr-1" /> PDF</>
                                  )
                                ) : (
                                  <><AlertCircle className="h-4 w-4 mr-1" /> PDF</>
                                )}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!pdfStatus.possible ? (
                            <TooltipContent>
                              <p>{pdfStatus.reason}</p>
                            </TooltipContent>
                          ) : !fieldsStatus.complete ? (
                            <TooltipContent>
                              <p className="font-semibold">Datos incompletos:</p>
                              <p>Falta: {fieldsStatus.missingFields.join(', ')}</p>
                              <p className="text-xs mt-1">Se generará PDF con los datos disponibles</p>
                            </TooltipContent>
                          ) : (
                            <TooltipContent>
                              <p>Generar PDF completo</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
