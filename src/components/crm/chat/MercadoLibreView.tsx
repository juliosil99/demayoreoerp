
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Clock, TrendingUp, Package } from 'lucide-react';
import { useMercadoLibreInteractions, useMercadoLibreStats } from '@/hooks/useMercadoLibreChat';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const MercadoLibreView = () => {
  const { data: interactions = [], isLoading } = useMercadoLibreInteractions();
  const { data: stats } = useMercadoLibreStats();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando preguntas de MercadoLibre...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Preguntas</p>
                <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{stats?.avgResponseTime || 0}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Simples</p>
                <p className="text-2xl font-bold">{stats?.classifications?.simple || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Productos Únicos</p>
                <p className="text-2xl font-bold">
                  {Object.keys(stats?.topProducts || {}).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Preguntas de MercadoLibre
          </CardTitle>
        </CardHeader>
        <CardContent>
          {interactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay preguntas de MercadoLibre registradas</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {interactions.map((interaction: any) => {
                  const metadata = interaction.metadata || {};
                  return (
                    <div key={interaction.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {metadata.original_question || interaction.subject}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente: {metadata.from_user_nickname || metadata.from_user}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="outline" 
                            className={getComplexityColor(metadata.classification?.complexity)}
                          >
                            {metadata.classification?.complexity || 'Sin clasificar'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(interaction.interaction_date), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {metadata.product_title && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Producto:</p>
                          <p className="text-sm text-muted-foreground">
                            {metadata.product_title}
                            {metadata.product_price && ` - $${metadata.product_price} MXN`}
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <p className="text-sm font-medium">Respuesta enviada:</p>
                        <p className="text-sm text-muted-foreground">
                          {metadata.generated_response || interaction.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Tiempo: {metadata.response_time_seconds || 0}s</span>
                        <span>Modelo: {metadata.ai_model_used || 'N/A'}</span>
                        <span>ID: {metadata.question_id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
