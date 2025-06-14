
import { Card, CardContent } from '@/components/ui/card';
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
  MessageSquare,
  Package
} from 'lucide-react';
import { Interaction } from '@/types/crm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InteractionTimelineProps {
  interactions: Interaction[];
}

export const InteractionTimeline = ({ interactions }: InteractionTimelineProps) => {
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
      default: return FileText;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'email': return 'text-blue-600 bg-blue-100';
      case 'call': return 'text-green-600 bg-green-100';
      case 'meeting': return 'text-purple-600 bg-purple-100';
      case 'note': return 'text-gray-600 bg-gray-100';
      case 'task': return 'text-orange-600 bg-orange-100';
      case 'sale': return 'text-emerald-600 bg-emerald-100';
      case 'invoice': return 'text-indigo-600 bg-indigo-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'mercadolibre_question': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
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
      default: return type;
    }
  };

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay interacciones registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {interactions.map((interaction, index) => {
        const Icon = getInteractionIcon(interaction.type);
        const colorClass = getInteractionColor(interaction.type);
        const metadata = interaction.metadata || {};

        // Para mercadolibre_question usamos la pregunta original como subject principal
        const isMLQuestion = interaction.type === 'mercadolibre_question';
        const subject = isMLQuestion && metadata.original_question
          ? metadata.original_question
          : (interaction.subject || `${getTypeLabel(interaction.type)} sin título`);
        
        return (
          <div key={interaction.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Avatar className={`h-10 w-10 ${colorClass}`}>
                <AvatarFallback className={colorClass}>
                  <Icon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              {index < interactions.length - 1 && (
                <div className="w-px h-8 bg-border mt-2" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <Card className="mb-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Mostrar subject principal (pregunta completa si es ML) */}
                      <h4 className="font-medium" title={subject}>
                        {subject}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(interaction.type)}
                      </Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(interaction.interaction_date), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </time>
                  </div>
                  
                  {interaction.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {interaction.description}
                    </p>
                  )}
                  
                  {interaction.outcome && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Resultado: </span>
                      <span>{interaction.outcome}</span>
                    </div>
                  )}
                  
                  {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      {/* Metadata general */}
                      {interaction.metadata.amount && (
                        <div>Monto: ${interaction.metadata.amount}</div>
                      )}
                      {interaction.metadata.order_number && (
                        <div>Orden: {interaction.metadata.order_number}</div>
                      )}
                      {interaction.metadata.product_name && (
                        <div>Producto: {interaction.metadata.product_name}</div>
                      )}
                      
                      {/* Metadata específica de MercadoLibre - Eliminado "Pregunta" duplicada */}
                      {isMLQuestion && (
                        <>
                          {interaction.metadata.platform && (
                            <div className="flex items-center gap-1 mb-1">
                              <Package className="h-3 w-3" />
                              <span className="font-medium">Plataforma:</span> {interaction.metadata.platform}
                            </div>
                          )}
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
                          {interaction.metadata.from_user_nickname && (
                            <div className="mb-1">
                              <span className="font-medium">Cliente:</span> {interaction.metadata.from_user_nickname}
                            </div>
                          )}
                          {/* Eliminado: Mostrar pregunta duplicada */}
                          {interaction.metadata.response_time_seconds && (
                            <div className="text-xs text-gray-500">
                              Respondido en {interaction.metadata.response_time_seconds}s
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {interaction.next_follow_up && (
                    <div className="mt-2 text-sm text-orange-600">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Seguimiento: {format(new Date(interaction.next_follow_up), 'dd MMM yyyy', { locale: es })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
};
