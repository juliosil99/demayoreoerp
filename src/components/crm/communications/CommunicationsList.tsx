
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  ShoppingCart,
  Package,
  MessageSquare
} from 'lucide-react';
import { Interaction } from '@/types/crm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChannelBadge } from './ChannelBadge';

interface CommunicationsListProps {
  interactions: Interaction[];
}

export const CommunicationsList = ({ interactions }: CommunicationsListProps) => {
  console.log('📋 [CommunicationsList] Rendering with interactions:', {
    count: interactions.length,
    interactions: interactions.map(i => ({
      id: i.id,
      type: i.type,
      subject: i.subject,
      company: i.company?.name,
      contact: i.contact?.name,
      user_id: i.user_id
    }))
  });

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'note': return FileText;
      case 'task': return FileText;
      case 'sale': return ShoppingCart;
      case 'mercadolibre_question': return Package;
      default: return MessageSquare;
    }
  };

  if (interactions.length === 0) {
    console.log('⚠️ [CommunicationsList] No interactions to render');
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => {
        const Icon = getInteractionIcon(interaction.type);
        const metadata = interaction.metadata || {};
        
        return (
          <div key={interaction.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback>
                <Icon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium truncate">
                  {interaction.subject || `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} sin título`}
                </h4>
                <ChannelBadge type={interaction.type} metadata={metadata} />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(interaction.interaction_date), 'dd MMM yyyy, HH:mm', { locale: es })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {interaction.company?.name || interaction.contact?.name || 'Sin empresa'}
              </p>
              
              {interaction.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {interaction.description}
                </p>
              )}
              
              {/* MercadoLibre specific info */}
              {interaction.type === 'mercadolibre_question' && metadata?.original_question && (
                <div className="bg-yellow-50 p-2 rounded text-sm mb-2">
                  <span className="font-medium">Pregunta: </span>
                  {metadata.original_question}
                </div>
              )}
              
              {interaction.outcome && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Resultado: </span>
                  <span>{interaction.outcome}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
