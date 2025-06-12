
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CommunicationsHeaderProps {
  totalCount: number;
  onNewInteraction: () => void;
}

export const CommunicationsHeader = ({ totalCount, onNewInteraction }: CommunicationsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Comunicaciones</h2>
        <p className="text-muted-foreground">
          Vista unificada de todas las interacciones con clientes ({totalCount} total)
        </p>
      </div>
      <Button onClick={onNewInteraction}>
        <Plus className="h-4 w-4 mr-2" />
        Nueva Interacción
      </Button>
    </div>
  );
};
