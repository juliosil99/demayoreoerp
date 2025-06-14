
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckSquare, 
  ShoppingCart,
  Receipt,
  CreditCard,
  Clock,
  MessageSquare,
  Package,
  Send
} from 'lucide-react';
import { Interaction } from '@/types/crm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageBubbleProps {
  interaction: Interaction;
  isOutgoing?: boolean;
}

export const MessageBubble = ({ interaction, isOutgoing = true }: MessageBubbleProps) => {
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'note': return FileText;
      case 'task': return CheckSquare;
      case 'sale': return ShoppingCart;
      case 'invoice': return Receipt;
      case 'payment': return CreditCard;
      case 'mercadolibre_question': return MessageSquare;
      case 'mercadolibre_answer': return Send;
      default: return FileText;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'email': return 'text-blue-600 bg-blue-50';
      case 'call': return 'text-green-600 bg-green-50';
      case 'meeting': return 'text-purple-600 bg-purple-50';
      case 'note': return 'text-gray-600 bg-gray-50';
      case 'task': return 'text-orange-600 bg-orange-50';
      case 'sale': return 'text-emerald-600 bg-emerald-50';
      case 'invoice': return 'text-indigo-600 bg-indigo-50';
      case 'payment': return 'text-green-600 bg-green-50';
      case 'mercadolibre_question': return 'text-yellow-600 bg-yellow-50';
      case 'mercadolibre_answer': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'call': return 'Llamada';
      case 'meeting': return 'Reunión';
      case 'note': return 'Nota';
      case 'task': return 'Tarea';
      case 'sale': return 'Venta';
      case 'invoice': return 'Factura';
      case 'payment': return 'Pago';
      case 'mercadolibre_question': return 'Pregunta ML';
      case 'mercadolibre_answer': return 'Respuesta ML';
      default: return type;
    }
  };

  const Icon = getInteractionIcon(interaction.type);
  const colorClass = getInteractionColor(interaction.type);

  // The `isOutgoing` prop is now correctly set from ChatView.
  const messageIsOutgoing = isOutgoing;
  const isMLQuestion = interaction.type === 'mercadolibre_question';
  const isMLAnswer = interaction.type === 'mercadolibre_answer';

  // For ML questions, use original_question. For our answers, subject is set in ChatView.
  const subject = isMLQuestion && interaction.metadata?.original_question
    ? interaction.metadata.original_question
    : interaction.subject;

  return (
    <div className={`flex gap-3 mb-4 ${messageIsOutgoing ? 'justify-end' : 'justify-start'}`}>
      {!messageIsOutgoing && (
        <Avatar className={`h-8 w-8 ${colorClass} flex-shrink-0`}>
          <AvatarFallback className={colorClass}>
            <Icon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${messageIsOutgoing ? 'order-1' : 'order-2'}`}>
        <Card className={`p-3 ${
          messageIsOutgoing 
            ? 'bg-blue-500 text-white border-blue-500' 
            : isMLQuestion
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                messageIsOutgoing 
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
              messageIsOutgoing ? 'text-blue-100' : 'text-muted-foreground'
            }`}>
              {format(new Date(interaction.interaction_date), 'HH:mm', { locale: es })}
            </span>
          </div>
          
          {/* Mostrar pregunta o respuesta como título principal */}
          {subject && (
            <h4 className={`font-medium text-sm mb-1 ${
              messageIsOutgoing ? 'text-white' : 'text-gray-900'
            }`} title={subject}>
              {subject}
            </h4>
          )}
          
          {/* This part will now be empty for ML messages since we moved the content */}
          {interaction.description && (
            <p className={`text-sm mb-2 ${
              messageIsOutgoing ? 'text-blue-50' : 'text-gray-600'
            }`}>
              {interaction.description}
            </p>
          )}
          
          {interaction.outcome && (
            <div className={`text-sm ${
              messageIsOutgoing ? 'text-blue-50' : 'text-gray-600'
            }`}>
              <span className="font-medium">Resultado: </span>
              <span>{interaction.outcome}</span>
            </div>
          )}
          
          {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
            <div className={`mt-2 p-2 rounded text-xs ${
              messageIsOutgoing 
                ? 'bg-blue-400 text-blue-50' 
                : isMLQuestion
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-50 text-gray-600'
            }`}>
              {/* Metadata for ML Question */}
              {isMLQuestion && (
                <>
                  {interaction.metadata.product_title && (
                    <div className="mb-1">
                      <span className="font-medium">Producto:</span> {interaction.metadata.product_title}
                    </div>
                  )}
                  {interaction.metadata.product_price && (
                    <div className="mb-1">
                      <span className="font-medium">Precio:</span> ${interaction.metadata.product_price}
                    </div>
                  )}
                </>
              )}
              
              {/* Metadata for ML Answer */}
              {isMLAnswer && interaction.metadata.response_time_seconds && (
                  <div className="text-xs opacity-75">
                    Respondido en {interaction.metadata.response_time_seconds}s
                  </div>
              )}
              
              {/* Metadata general para otros tipos */}
              {!isMLQuestion && !isMLAnswer && (
                <>
                  {interaction.metadata.amount && (
                    <div>Monto: ${interaction.metadata.amount}</div>
                  )}
                  {interaction.metadata.order_number && (
                    <div>Orden: {interaction.metadata.order_number}</div>
                  )}
                  {interaction.metadata.product_name && (
                    <div>Producto: {interaction.metadata.product_name}</div>
                  )}
                </>
              )}
            </div>
          )}
          
          {interaction.next_follow_up && (
            <div className={`mt-2 flex items-center gap-1 text-xs ${
              messageIsOutgoing ? 'text-blue-100' : 'text-orange-600'
            }`}>
              <Clock className="h-3 w-3" />
              <span>
                Seguimiento: {format(new Date(interaction.next_follow_up), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
        </Card>
        
        <div className={`text-xs text-muted-foreground mt-1 ${
          messageIsOutgoing ? 'text-right' : 'text-left'
        }`}>
          {format(new Date(interaction.interaction_date), 'dd MMM yyyy', { locale: es })}
        </div>
      </div>
      
      {messageIsOutgoing && (
        <Avatar className={`h-8 w-8 bg-blue-500 text-white flex-shrink-0`}>
          <AvatarFallback className="bg-blue-500 text-white">
            <Icon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
