
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

interface ProductTableProps {
  products: ProductSearchResult[];
  isLoading: boolean;
  downloadXml: (invoiceId: number) => Promise<void>;
  generatePdf: (invoiceId: number, issuerRfc: string) => Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  downloadXml,
  generatePdf,
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <ProductTableHeader />
        </TableHeader>
        <TableBody>
          {products.map((product) => (
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
  );
};
