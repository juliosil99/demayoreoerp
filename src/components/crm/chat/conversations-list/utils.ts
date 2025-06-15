
import { ConversationPreview } from './types';

export const getStatusProps = (conv: ConversationPreview) => {
  // Las preguntas de ML siempre se tratan como cerradas en la UI
  const isMercadoLibre = conv.last_message_type === 'mercadolibre_question';
  const effectiveStatus = isMercadoLibre ? 'closed' : conv.conversation_status;

  switch (effectiveStatus) {
    case 'closed':
      return {
        text: 'Cerrada',
        className: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant: 'outline' as const,
      };
    case 'pending_response':
      return {
        text: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        variant: 'default' as const,
      };
    case 'open':
    default:
      return {
        text: 'Abierta',
        className: 'bg-green-100 text-green-800 border-green-200',
        variant: 'default' as const,
      };
  }
};
