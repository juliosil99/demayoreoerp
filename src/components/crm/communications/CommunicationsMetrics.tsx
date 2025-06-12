
import { Badge } from '@/components/ui/badge';
import { Interaction } from '@/types/crm';

interface CommunicationsMetricsProps {
  interactions: Interaction[];
}

export const CommunicationsMetrics = ({ interactions }: CommunicationsMetricsProps) => {
  return (
    <div className="flex gap-2">
      <Badge variant="outline">
        Total: {interactions.length}
      </Badge>
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
        ML: {interactions.filter(i => i.type === 'mercadolibre_question').length}
      </Badge>
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        Email: {interactions.filter(i => i.type === 'email').length}
      </Badge>
      <Badge variant="outline" className="bg-green-50 text-green-700">
        Llamadas: {interactions.filter(i => i.type === 'call').length}
      </Badge>
    </div>
  );
};
