
import React from "react";
import { ProductSearchResult } from "@/types/product-search";
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  
  // Reset to first page when products change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <ProductTable
        products={products}
        isLoading={isLoading}
        downloadXml={downloadXml}
        generatePdf={generatePdf}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
