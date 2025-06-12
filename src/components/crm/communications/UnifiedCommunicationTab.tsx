
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  ShoppingCart,
  Package,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Interaction } from '@/types/crm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChannelBadge } from './ChannelBadge';
import { InteractionDialog } from '@/components/crm/InteractionDialog';
import { useState } from 'react';

interface UnifiedCommunicationTabProps {
  companyId: string;
  companyName: string;
  interactions: Interaction[];
}

export const UnifiedCommunicationTab = ({ 
  companyId, 
  companyName, 
  interactions 
}: UnifiedCommunicationTabProps) => {
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);

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

  // Sort interactions by date (most recent first)
  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Historial de Comunicación
          </CardTitle>
          <Button size="sm" onClick={() => setShowInteractionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Interacción
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedInteractions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay comunicaciones</h3>
            <p className="text-muted-foreground mb-4">
              Aún no hay interacciones registradas con {companyName}
            </p>
            <Button onClick={() => setShowInteractionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primera Interacción
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedInteractions.map((interaction, index) => {
              const Icon = getInteractionIcon(interaction.type);
              
              return (
                <div key={interaction.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <Icon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    {index < sortedInteractions.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Card className="mb-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">
                              {interaction.subject || `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} sin título`}
                            </h4>
                            <ChannelBadge type={interaction.type} metadata={interaction.metadata} />
                          </div>
                          <time className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(interaction.interaction_date), 'dd MMM yyyy, HH:mm', { locale: es })}
                          </time>
                        </div>
                        
                        {/* MercadoLibre specific content */}
                        {interaction.type === 'mercadolibre_question' && interaction.metadata?.original_question && (
                          <div className="mb-2 p-2 bg-yellow-50 rounded text-sm">
                            <div className="font-medium text-yellow-800 mb-1">Pregunta del Cliente:</div>
                            <div className="text-yellow-700">{interaction.metadata.original_question}</div>
                            {interaction.metadata.product_title && (
                              <div className="mt-1 text-xs text-yellow-600">
                                Producto: {interaction.metadata.product_title}
                                {interaction.metadata.product_price && ` - $${interaction.metadata.product_price}`}
                              </div>
                            )}
                          </div>
                        )}
                        
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
                        
                        {interaction.metadata && Object.keys(interaction.metadata).length > 0 && interaction.type !== 'mercadolibre_question' && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
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
        )}
      </CardContent>

      <InteractionDialog
        open={showInteractionDialog}
        onOpenChange={setShowInteractionDialog}
        companyId={companyId}
      />
    </Card>
  );
};
