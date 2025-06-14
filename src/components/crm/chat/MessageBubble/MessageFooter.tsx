
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Interaction } from '@/types/crm';

interface MessageFooterProps {
  interaction: Interaction;
  isOutgoing: boolean;
}

export const MessageFooter = ({ interaction, isOutgoing }: MessageFooterProps) => {
  if (!interaction.next_follow_up) {
    return null;
  }

  return (
    <div className={`mt-2 flex items-center gap-1 text-xs ${
      isOutgoing ? 'text-blue-100' : 'text-orange-600'
    }`}>
      <Clock className="h-3 w-3" />
      <span>
        Seguimiento: {format(new Date(interaction.next_follow_up), 'dd MMM yyyy', { locale: es })}
      </span>
    </div>
  );
};
