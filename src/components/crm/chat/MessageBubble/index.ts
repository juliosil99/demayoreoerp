
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Interaction } from '@/types/crm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getInteractionIcon, getInteractionColor } from './utils';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageMetadata } from './MessageMetadata';
import { MessageFooter } from './MessageFooter';

interface MessageBubbleProps {
  interaction: Interaction;
  isOutgoing?: boolean;
}

export const MessageBubble = ({ interaction, isOutgoing = true }: MessageBubbleProps) => {
  const Icon = getInteractionIcon(interaction.type);
  const colorClass = getInteractionColor(interaction.type);

  const isMLQuestion = interaction.type === 'mercadolibre_question';
  const isMLAnswer = interaction.type === 'mercadolibre_answer';

  const subject = isMLQuestion && interaction.metadata?.original_question
    ? interaction.metadata.original_question
    : interaction.subject;

  return (
    <div className={`flex gap-3 mb-4 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      {!isOutgoing && (
        <Avatar className={`h-8 w-8 ${colorClass} flex-shrink-0`}>
          <AvatarFallback className={colorClass}>
            <Icon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isOutgoing ? 'order-1' : 'order-2'}`}>
        <Card className={`p-3 ${
          isOutgoing 
            ? 'bg-blue-500 text-white border-blue-500' 
            : isMLQuestion
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white border-gray-200'
        }`}>
          <MessageHeader 
            interaction={interaction}
            isOutgoing={isOutgoing}
            isMLQuestion={isMLQuestion}
          />
          <MessageContent
            interaction={interaction}
            isOutgoing={isOutgoing}
            subject={subject}
          />
          <MessageMetadata 
            interaction={interaction}
            isOutgoing={isOutgoing}
            isMLQuestion={isMLQuestion}
            isMLAnswer={isMLAnswer}
          />
          <MessageFooter
            interaction={interaction}
            isOutgoing={isOutgoing}
          />
        </Card>
        
        <div className={`text-xs text-muted-foreground mt-1 ${
          isOutgoing ? 'text-right' : 'text-left'
        }`}>
          {format(new Date(interaction.interaction_date), 'dd MMM yyyy', { locale: es })}
        </div>
      </div>
      
      {isOutgoing && (
        <Avatar className={`h-8 w-8 bg-blue-500 text-white flex-shrink-0`}>
          <AvatarFallback className="bg-blue-500 text-white">
            <Icon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
