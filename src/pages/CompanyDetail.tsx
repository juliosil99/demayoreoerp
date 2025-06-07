
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  Globe, 
  MapPin, 
  Users, 
  TrendingUp,
  Calendar,
  Plus,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useCrmCompany } from '@/hooks/useCrmCompanies';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { CompanyDialog } from '@/components/crm/CompanyDialog';
import { InteractionDialog } from '@/components/crm/InteractionDialog';
import { InteractionTimeline } from '@/components/crm/InteractionTimeline';
import { ContactsTab } from '@/components/crm/ContactsTab';
import { ChatView } from '@/components/crm/chat';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Contact, Company } from '@/types/crm';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);

  const { data: rawCompany, isLoading } = useCrmCompany(id!);
  const { data: interactions = [] } = useCrmInteractions(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!rawCompany) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Empresa no encontrada</h3>
        <Button onClick={() => navigate('/companies')}>
          Volver a Empresas
        </Button>
      </div>
    );
  }

  // Extract contacts from raw data before type casting
  const rawContacts = rawCompany.contacts || [];
  
  // Type-cast the raw company data to ensure proper typing
  const company: Company = {
    ...rawCompany,
    company_size: rawCompany.company_size as Company['company_size'],
    status: rawCompany.status as Company['status'],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'customer': return 'Cliente';
      case 'prospect': return 'Prospecto';
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'churned': return 'Perdido';
      default: return status;
    }
  };

  // Convert contacts to proper Contact type
  const contacts: Contact[] = rawContacts.map((contact: any) => ({
    ...contact,
    company_id: contact.company_id || '',
    contact_status: contact.contact_status || 'active',
    engagement_score: contact.engagement_score || 0,
    is_primary_contact: contact.is_primary_contact || false,
    postal_code: contact.postal_code || '',
    tax_regime: contact.tax_regime || '',
    created_at: contact.created_at || new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <Badge className={getStatusColor(company.status)}>
              {getStatusText(company.status)}
            </Badge>
          </div>
          {company.industry && (
            <p className="text-muted-foreground">{company.industry}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInteractionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Interacción
          </Button>
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Company Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">{company.engagement_score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Contactos</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Interacciones</p>
                <p className="text-2xl font-bold">{interactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Última Interacción</p>
                <p className="text-sm font-medium">
                  {company.last_interaction_date 
                    ? formatDistanceToNow(new Date(company.last_interaction_date), { 
                        addSuffix: true, 
                        locale: es 
                      })
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}

            {company.headquarters_location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{company.headquarters_location}</span>
              </div>
            )}

            {company.employee_count && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{company.employee_count} empleados</span>
              </div>
            )}

            {company.founded_year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Fundada en {company.founded_year}</span>
              </div>
            )}

            {company.annual_revenue && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">Ingresos Anuales</p>
                <p className="font-semibold text-lg">
                  ${company.annual_revenue.toLocaleString('es-MX')}
                </p>
              </div>
            )}

            {company.description && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                <p className="text-sm">{company.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="interactions">Interacciones</TabsTrigger>
              <TabsTrigger value="contacts">Contactos</TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatView
                companyId={company.id}
                companyName={company.name}
              />
            </TabsContent>

            <TabsContent value="interactions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Timeline de Interacciones</CardTitle>
                    <Button size="sm" onClick={() => setShowInteractionDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Interacción
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <InteractionTimeline interactions={interactions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <ContactsTab companyId={company.id} contacts={contacts} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CompanyDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        company={company}
      />

      <InteractionDialog
        open={showInteractionDialog}
        onOpenChange={setShowInteractionDialog}
        companyId={company.id}
      />
    </div>
  );
};

export default CompanyDetail;
