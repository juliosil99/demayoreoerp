
import React from "react";
import { ProductSearchResult } from "@/types/product-search";
import { InfoAlert } from "./InfoAlert";
import { ProductTable } from "./table/ProductTable";

interface ProductSearchResultsProps {
  products: ProductSearchResult[];
  isLoading: boolean;
  downloadXml: (invoiceId: number) => Promise<void>;
  generatePdf: (invoiceId: number, issuerRfc: string) => Promise<void>;
}

export const ProductSearchResults: React.FC<ProductSearchResultsProps> = ({
  products,
  isLoading,
  downloadXml,
  generatePdf,
}) => {
  return (
    <div className="space-y-4">
      <InfoAlert />
      <ProductTable
        products={products}
        isLoading={isLoading}
        downloadXml={downloadXml}
        generatePdf={generatePdf}
      />
    </div>
  );
};
