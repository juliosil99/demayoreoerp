
import { Card, CardContent } from "@/components/ui/card";
import { PaymentTable } from "./PaymentTable";
import { PaymentFilters } from "./PaymentFilters";
import { PaymentPagination } from "./PaymentPagination";

interface PaymentsContentProps {
  payments: any[];
  isLoading: boolean;
  pagination: any;
  filters: any;
  onUpdateFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  onEdit: (payment: any) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: 'confirmed' | 'pending') => void;
  onViewReconciled: (id: string) => void;
}

export function PaymentsContent({
  payments,
  isLoading,
  pagination,
  filters,
  onUpdateFilters,
  setPagination,
  onEdit,
  onDelete,
  onStatusUpdate,
  onViewReconciled
}: PaymentsContentProps) {
  const showReconciledFilter = (value: boolean | 'all') => {
    onUpdateFilters({
      ...filters,
      isReconciled: value
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <PaymentFilters 
            filters={filters} 
            onChangeFilters={onUpdateFilters} 
            onToggleReconciled={showReconciledFilter}
          />
        </div>

        <PaymentTable 
          payments={payments} 
          isLoading={isLoading} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onStatusUpdate={onStatusUpdate}
          onViewReconciled={onViewReconciled}
        />

        <PaymentPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      </CardContent>
    </Card>
  );
}
