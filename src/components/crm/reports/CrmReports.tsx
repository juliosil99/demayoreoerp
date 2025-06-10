
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { useCrmCompanies } from '@/hooks/useCrmCompanies';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { formatCurrency } from '@/utils/formatters';

export const CrmReports = () => {
  const { data: companies = [] } = useCrmCompanies();
  const { data: opportunities = [] } = useOpportunities();
  const { data: interactions = [] } = useCrmInteractions();

  // Calculate metrics
  const totalCompanies = companies.length;
  const activeCustomers = companies.filter(c => c.status === 'customer').length;
  const prospects = companies.filter(c => c.status === 'prospect').length;
  const totalOpportunities = opportunities.length;
  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const wonOpportunities = opportunities.filter(opp => opp.stage?.is_closed && opp.actual_close_date).length;
  const conversionRate = totalOpportunities > 0 ? ((wonOpportunities / totalOpportunities) * 100).toFixed(1) : '0';
  
  // Engagement metrics
  const avgEngagement = companies.length > 0 
    ? Math.round(companies.reduce((sum, c) => sum + c.engagement_score, 0) / companies.length)
    : 0;

  // This month interactions
  const currentMonth = new Date().getMonth();
  const thisMonthInteractions = interactions.filter(interaction => 
    new Date(interaction.created_at).getMonth() === currentMonth
  ).length;

  // Opportunities by stage
  const opportunityStages = opportunities.reduce((acc, opp) => {
    const stageName = opp.stage?.name || 'Sin etapa';
    acc[stageName] = (acc[stageName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Revenue metrics
  const closedDeals = opportunities.filter(opp => opp.stage?.is_closed && opp.actual_close_date);
  const thisMonthRevenue = closedDeals
    .filter(deal => new Date(deal.actual_close_date!).getMonth() === currentMonth)
    .reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes CRM</h2>
          <p className="text-muted-foreground">
            Análisis y métricas de rendimiento de ventas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Empresas</p>
                    <p className="text-2xl font-bold">{totalCompanies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Activos</p>
                    <p className="text-2xl font-bold">{activeCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa Conversión</p>
                    <p className="text-2xl font-bold">{conversionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Pipeline</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{avgEngagement}/100</div>
                <p className="text-sm text-muted-foreground">Score de compromiso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ingresos del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(thisMonthRevenue)}
                </div>
                <p className="text-sm text-muted-foreground">Deals cerrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actividad del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{thisMonthInteractions}</div>
                <p className="text-sm text-muted-foreground">Interacciones</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(opportunityStages).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{stage}</span>
                    <Badge variant="outline">{count} oportunidades</Badge>
                  </div>
                ))}
                {Object.keys(opportunityStages).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay oportunidades registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Interacciones Totales</h4>
                  <p className="text-2xl font-bold">{interactions.length}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Este Mes</h4>
                  <p className="text-2xl font-bold">{thisMonthInteractions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Clientes</span>
                    <Badge variant="default">{activeCustomers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Prospectos</span>
                    <Badge variant="secondary">{prospects}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactivos</span>
                    <Badge variant="outline">
                      {companies.filter(c => c.status === 'inactive').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Oportunidades Totales</span>
                    <span className="font-bold">{totalOpportunities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deals Ganados</span>
                    <span className="font-bold text-green-600">{wonOpportunities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasa de Conversión</span>
                    <span className="font-bold">{conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
