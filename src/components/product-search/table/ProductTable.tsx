
import React from "react";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ProductTableRow } from "./ProductTableRow";
import { ProductSearchResult } from "@/types/product-search";
import { ProductTableHeader } from "./ProductTableHeader";
import { EmptyState } from "../states/EmptyState";
import { LoadingState } from "../states/LoadingState";
import { ProductPagination } from "../pagination/ProductPagination";

interface ProductTableProps {
  products: ProductSearchResult[];
  isLoading: boolean;
  downloadXml: (invoiceId: number) => Promise<void>;
  generatePdf: (invoiceId: number, issuerRfc: string) => Promise<void>;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  downloadXml,
  generatePdf,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  // Calculate total pages based on the total number of products and items per page
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, products.length);
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <ProductTableHeader />
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                downloadXml={downloadXml}
                generatePdf={generatePdf}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
