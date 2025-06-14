
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Interaction } from '@/types/crm';
import { getTypeLabel } from './utils';

interface MessageHeaderProps {
  interaction: Interaction;
  isOutgoing: boolean;
  isMLQuestion: boolean;
}

export const MessageHeader = ({ interaction, isOutgoing, isMLQuestion }: MessageHeaderProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Badge 
        variant="secondary" 
        className={`text-xs ${
          isOutgoing 
            ? 'bg-blue-400 text-blue-50' 
            : isMLQuestion
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        {getTypeLabel(interaction.type)}
      </Badge>
      {isMLQuestion && interaction.metadata?.platform && (
        <Badge variant="outline" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          {interaction.metadata.platform}
        </Badge>
      )}
      <span className={`text-xs ${
        isOutgoing ? 'text-blue-100' : 'text-muted-foreground'
      }`}>
        {format(new Date(interaction.interaction_date), 'HH:mm', { locale: es })}
      </span>
    </div>
  );
};
