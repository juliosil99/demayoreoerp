
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Info 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductSearchResult } from "@/types/product-search";
import { usePdfValidation } from "../hooks/usePdfValidation";

interface ActionButtonsProps {
  product: ProductSearchResult;
  downloadXml: (invoiceId: number) => Promise<void>;
  generatePdf: (invoiceId: number, issuerRfc: string) => Promise<void>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  product,
  downloadXml,
  generatePdf,
}) => {
  const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);
  const [downloadingXml, setDownloadingXml] = useState<number | null>(null);
  
  const { pdfStatus, fieldsStatus } = usePdfValidation(product);
  
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

  return (
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
  );
};
