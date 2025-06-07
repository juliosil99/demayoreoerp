
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
  Clock
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
      default: return type;
    }
  };

  const Icon = getInteractionIcon(interaction.type);
  const colorClass = getInteractionColor(interaction.type);

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
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                isOutgoing 
                  ? 'bg-blue-400 text-blue-50' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getTypeLabel(interaction.type)}
            </Badge>
            <span className={`text-xs ${
              isOutgoing ? 'text-blue-100' : 'text-muted-foreground'
            }`}>
              {format(new Date(interaction.interaction_date), 'HH:mm', { locale: es })}
            </span>
          </div>
          
          {interaction.subject && (
            <h4 className={`font-medium text-sm mb-1 ${
              isOutgoing ? 'text-white' : 'text-gray-900'
            }`}>
              {interaction.subject}
            </h4>
          )}
          
          {interaction.description && (
            <p className={`text-sm mb-2 ${
              isOutgoing ? 'text-blue-50' : 'text-gray-600'
            }`}>
              {interaction.description}
            </p>
          )}
          
          {interaction.outcome && (
            <div className={`text-sm ${
              isOutgoing ? 'text-blue-50' : 'text-gray-600'
            }`}>
              <span className="font-medium">Resultado: </span>
              <span>{interaction.outcome}</span>
            </div>
          )}
          
          {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
            <div className={`mt-2 p-2 rounded text-xs ${
              isOutgoing 
                ? 'bg-blue-400 text-blue-50' 
                : 'bg-gray-50 text-gray-600'
            }`}>
              {interaction.metadata.amount && (
                <div>Monto: ${interaction.metadata.amount}</div>
              )}
              {interaction.metadata.order_number && (
                <div>Orden: {interaction.metadata.order_number}</div>
              )}
              {interaction.metadata.product_name && (
                <div>Producto: {interaction.metadata.product_name}</div>
              )}
            </div>
          )}
          
          {interaction.next_follow_up && (
            <div className={`mt-2 flex items-center gap-1 text-xs ${
              isOutgoing ? 'text-blue-100' : 'text-orange-600'
            }`}>
              <Clock className="h-3 w-3" />
              <span>
                Seguimiento: {format(new Date(interaction.next_follow_up), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
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
