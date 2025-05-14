
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSearchFilters } from "@/components/product-search/ProductSearchFilters";
import { ProductSearchResults } from "@/components/product-search/ProductSearchResults";
import { useProductSearch } from "@/hooks/useProductSearch";

const ProductSearch = () => {
  const {
    products,
    isLoading,
    searchTerm,
    setSearchTerm,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSearch,
    downloadXml,
    generatePdf
  } = useProductSearch();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Búsqueda de Productos en Facturas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductSearchResults
            products={products}
            isLoading={isLoading}
            downloadXml={downloadXml}
            generatePdf={generatePdf}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSearch;
