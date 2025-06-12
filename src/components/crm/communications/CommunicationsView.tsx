
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Filter,
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  ShoppingCart,
  Package,
  MessageSquare,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { InteractionDialog } from '@/components/crm/InteractionDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommunicationFilters } from './CommunicationFilters';
import { ChannelBadge } from './ChannelBadge';

export const CommunicationsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);

  const { data: interactions = [], isLoading, error } = useCrmInteractions();

  console.log('CommunicationsView - interactions:', interactions);
  console.log('CommunicationsView - isLoading:', isLoading);
  console.log('CommunicationsView - error:', error);

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

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = !searchTerm || 
      interaction.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.companies_crm?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChannel = selectedChannel === 'all' || interaction.type === selectedChannel;
    
    return matchesSearch && matchesChannel;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Comunicaciones</h2>
            <p className="text-muted-foreground">
              Vista unificada de todas las interacciones con clientes
            </p>
          </div>
          <Button onClick={() => setShowInteractionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Interacción
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Error al cargar las comunicaciones</h3>
                <p className="text-sm text-muted-foreground">
                  {error.message || 'Ha ocurrido un error inesperado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <InteractionDialog
          open={showInteractionDialog}
          onOpenChange={setShowInteractionDialog}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comunicaciones</h2>
          <p className="text-muted-foreground">
            Vista unificada de todas las interacciones con clientes
          </p>
        </div>
        <Button onClick={() => setShowInteractionDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Interacción
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, asunto o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <CommunicationFilters
              selectedChannel={selectedChannel}
              onChannelChange={setSelectedChannel}
            />
          )}
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Interacciones ({filteredInteractions.length})
            </CardTitle>
            <div className="flex gap-2">
              {/* Channel summary badges */}
              <Badge variant="outline">
                Total: {filteredInteractions.length}
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                ML: {filteredInteractions.filter(i => i.type === 'mercadolibre_question').length}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Email: {filteredInteractions.filter(i => i.type === 'email').length}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Llamadas: {filteredInteractions.filter(i => i.type === 'call').length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInteractions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay interacciones</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedChannel !== 'all'
                    ? 'No se encontraron interacciones con los filtros aplicados'
                    : 'Aún no hay interacciones registradas'
                  }
                </p>
                <Button onClick={() => setShowInteractionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Interacción
                </Button>
              </div>
            ) : (
              filteredInteractions.map((interaction) => {
                const Icon = getInteractionIcon(interaction.type);
                
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
                        <ChannelBadge type={interaction.type} metadata={interaction.metadata} />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(interaction.interaction_date), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {interaction.companies_crm?.name || interaction.contacts?.name || 'Sin empresa'}
                      </p>
                      
                      {interaction.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {interaction.description}
                        </p>
                      )}
                      
                      {/* MercadoLibre specific info */}
                      {interaction.type === 'mercadolibre_question' && interaction.metadata?.original_question && (
                        <div className="bg-yellow-50 p-2 rounded text-sm mb-2">
                          <span className="font-medium">Pregunta: </span>
                          {interaction.metadata.original_question}
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
              })
            )}
          </div>
        </CardContent>
      </Card>

      <InteractionDialog
        open={showInteractionDialog}
        onOpenChange={setShowInteractionDialog}
      />
    </div>
  );
};
