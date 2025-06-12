
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';

interface CommunicationsEmptyStateProps {
  hasFilters: boolean;
  onNewInteraction: () => void;
}

export const CommunicationsEmptyState = ({ hasFilters, onNewInteraction }: CommunicationsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No hay interacciones</h3>
      <p className="text-muted-foreground mb-4">
        {hasFilters
          ? 'No se encontraron interacciones con los filtros aplicados'
          : 'Aún no hay interacciones registradas'
        }
      </p>
      <Button onClick={onNewInteraction}>
        <Plus className="h-4 w-4 mr-2" />
        Crear Primera Interacción
      </Button>
    </div>
  );
};
