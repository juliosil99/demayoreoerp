
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Database, 
  TrendingDown,
  Code,
  Zap,
  Target
} from 'lucide-react';
import { formatBytes } from '@/utils/formatters';

interface QueryAnalysis {
  table: string;
  endpoint: string;
  estimatedSize: number;
  frequency: number;
  optimization: string;
  priority: 'high' | 'medium' | 'low';
}

export function EgressAnalysisPanel() {
  const [queryAnalysis, setQueryAnalysis] = useState<QueryAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeQueries = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análisis de las consultas más problemáticas
      const analysis: QueryAnalysis[] = [
        {
          table: 'Sales',
          endpoint: 'GET /rest/v1/Sales',
          estimatedSize: 50000000, // 50MB
          frequency: 100,
          optimization: 'Implementar paginación con LIMIT 50. Usar SELECT específicos en lugar de SELECT *.',
          priority: 'high'
        },
        {
          table: 'invoices',
          endpoint: 'GET /rest/v1/invoices',
          estimatedSize: 30000000, // 30MB
          frequency: 80,
          optimization: 'Agregar filtros por fecha. Limitar campos devueltos (evitar xml_content).',
          priority: 'high'
        },
        {
          table: 'expenses',
          endpoint: 'GET /rest/v1/expenses',
          estimatedSize: 15000000, // 15MB
          frequency: 60,
          optimization: 'Implementar paginación. Filtrar por usuario automáticamente.',
          priority: 'medium'
        },
        {
          table: 'interactions',
          endpoint: 'GET /rest/v1/interactions',
          estimatedSize: 8000000, // 8MB
          frequency: 40,
          optimization: 'Limitar a últimas 1000 interacciones. Evitar traer metadata completa.',
          priority: 'medium'
        },
        {
          table: 'companies_crm',
          endpoint: 'GET /rest/v1/companies_crm',
          estimatedSize: 5000000, // 5MB
          frequency: 20,
          optimization: 'Implementar lazy loading. Paginar resultados.',
          priority: 'low'
        }
      ];

      // Simular delay de análisis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setQueryAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing queries:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    // Ejecutar análisis automáticamente al cargar
    analyzeQueries();
  }, []);

  const totalEstimatedSavings = queryAnalysis.reduce((sum, query) => sum + (query.estimatedSize * 0.7), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Análisis de Consultas Críticas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Identificación de endpoints que generan más Egress
            </p>
          </div>
          <Button 
            onClick={analyzeQueries}
            disabled={isAnalyzing}
            variant="outline"
          >
            {isAnalyzing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Re-analizar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {queryAnalysis.length > 0 && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <TrendingDown className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Potencial ahorro estimado:</strong> {formatBytes(totalEstimatedSavings)} 
              ({((totalEstimatedSavings / 1000000000) * 0.09).toFixed(2)} USD/día)
              {' '}aplicando las optimizaciones sugeridas.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {queryAnalysis.map((query, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(query.priority)}
                  <div>
                    <h4 className="font-semibold">{query.table}</h4>
                    <code className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                      {query.endpoint}
                    </code>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getPriorityColor(query.priority)}>
                    {query.priority.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatBytes(query.estimatedSize)} • {query.frequency} requests/día
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <h5 className="font-medium text-yellow-800 mb-1">Optimización Recomendada:</h5>
                <p className="text-yellow-700 text-sm">{query.optimization}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Impacto estimado: -{formatBytes(query.estimatedSize * 0.7)}</span>
                <span>Ahorro: ${((query.estimatedSize * 0.7 / 1000000000) * 0.09).toFixed(3)}/día</span>
              </div>
            </div>
          ))}
        </div>

        {queryAnalysis.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay análisis disponible. Haz clic en "Analizar" para comenzar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
