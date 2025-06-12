
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  Calendar,
  UserPlus,
  Clock,
  Target,
  BarChart3,
  Bell,
  Zap,
  Mail,
  Phone,
  FileText,
  ShoppingCart,
  Package
} from 'lucide-react';
import { useCrmCompanies } from '@/hooks/useCrmCompanies';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/utils/formatters';
import { PipelineView } from '@/components/crm/PipelineView';
import { CommunicationsView } from '@/components/crm/communications/CommunicationsView';
import { CrmReports } from '@/components/crm/reports/CrmReports';
import { NotificationCenter } from '@/components/crm/notifications/NotificationCenter';
import { FollowUpReminders } from '@/components/crm/follow-ups/FollowUpReminders';
import { CalendarView } from '@/components/crm/calendar/CalendarView';
import { WorkflowBuilder } from '@/components/crm/automation/WorkflowBuilder';

const CrmDashboard = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading: companiesLoading } = useCrmCompanies();
  const { data: allInteractions = [], isLoading: interactionsLoading, error: interactionsError } = useCrmInteractions();
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useOpportunities();

  // Debug logging
  console.log('CrmDashboard - allInteractions count:', allInteractions.length);
  console.log('CrmDashboard - interactionsError:', interactionsError);

  // Get recent interactions (last 10) from the main hook data
  const recentInteractions = allInteractions
    .sort((a, b) => new Date(b.created_at || b.interaction_date).getTime() - new Date(a.created_at || a.interaction_date).getTime())
    .slice(0, 10);

  console.log('CrmDashboard - recentInteractions count:', recentInteractions.length);

  // Calculate metrics
  const totalCompanies = companies.length;
  const totalContacts = companies.reduce((sum, company) => sum + (company.contacts?.length || 0), 0);
  const totalInteractions = allInteractions.length;
  const totalOpportunities = opportunities.length;
  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const avgEngagement = companies.length > 0 
    ? Math.round(companies.reduce((sum, c) => sum + c.engagement_score, 0) / companies.length)
    : 0;

  const recentCompanies = companies
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'note': return FileText;
      case 'task': return FileText;
      case 'sale': return ShoppingCart;
      case 'invoice': return FileText;
      case 'payment': return TrendingUp;
      case 'mercadolibre_question': return Package;
      default: return MessageSquare;
    }
  };

  const getChannelInfo = (type: string, metadata?: any) => {
    switch (type) {
      case 'mercadolibre_question':
        return { 
          label: 'MercadoLibre', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: Package
        };
      case 'email':
        return { 
          label: 'Email', 
          color: 'bg-blue-100 text-blue-800',
          icon: Mail
        };
      case 'call':
        return { 
          label: 'Llamada', 
          color: 'bg-green-100 text-green-800',
          icon: Phone
        };
      case 'meeting':
        return { 
          label: 'Reunión', 
          color: 'bg-purple-100 text-purple-800',
          icon: Calendar
        };
      default:
        return { 
          label: type.charAt(0).toUpperCase() + type.slice(1), 
          color: 'bg-gray-100 text-gray-800',
          icon: MessageSquare
        };
    }
  };

  if (companiesLoading || interactionsLoading || opportunitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            CRM Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus relaciones con clientes y prospectos
          </p>
        </div>
        <div className="flex gap-2">
          <NotificationCenter />
          <Button onClick={() => navigate('/contacts')} variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Contacto
          </Button>
          <Button onClick={() => navigate('/companies')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/companies')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Empresas</p>
                    <p className="text-2xl font-bold">{totalCompanies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/contacts')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contactos</p>
                    <p className="text-2xl font-bold">{totalContacts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Oportunidades</p>
                    <p className="text-2xl font-bold">{totalOpportunities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Pipeline</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Interacciones</p>
                    <p className="text-2xl font-bold">{totalInteractions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={() => navigate('/companies')}>
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Ver Empresas</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={() => navigate('/contacts')}>
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Ver Contactos</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Calendario</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Reportes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Companies */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Empresas Recientes
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCompanies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay empresas registradas</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/companies')}
                      >
                        Crear primera empresa
                      </Button>
                    </div>
                  ) : (
                    recentCompanies.map((company) => (
                      <div 
                        key={company.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/companies/${company.id}`)}
                      >
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.industry || 'Sin industria'}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {company.status === 'customer' ? 'Cliente' : 
                             company.status === 'prospect' ? 'Prospecto' : 
                             company.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(company.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interactionsError ? (
                    <div className="text-center py-8 text-destructive">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Error al cargar la actividad</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {interactionsError.message}
                      </p>
                    </div>
                  ) : recentInteractions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay actividad reciente</p>
                      <p className="text-xs mt-1">Las interacciones aparecerán aquí una vez que se registren</p>
                    </div>
                  ) : (
                    recentInteractions.map((interaction) => {
                      const channelInfo = getChannelInfo(interaction.type, interaction.metadata);
                      const Icon = channelInfo.icon;
                      
                      return (
                        <div key={interaction.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">
                                {interaction.subject || `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}`}
                              </p>
                              <Badge variant="secondary" className={`text-xs ${channelInfo.color}`}>
                                {channelInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {interaction.company?.name || interaction.contact?.name || 'Sin empresa'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(interaction.created_at || interaction.interaction_date), { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications">
          <CommunicationsView />
        </TabsContent>

        <TabsContent value="pipeline">
          <PipelineView />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>

        <TabsContent value="automation">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="reports">
          <CrmReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrmDashboard;
