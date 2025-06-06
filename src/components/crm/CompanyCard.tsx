
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Users, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { Company } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyCardProps {
  company: any;
  onClick?: () => void;
}

export const CompanyCard = ({ company, onClick }: CompanyCardProps) => {
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

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={company.logo_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                {company.name}
              </h3>
              {company.industry && (
                <p className="text-sm text-muted-foreground">{company.industry}</p>
              )}
            </div>
          </div>
          {company.website && (
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Status and Engagement */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={getStatusColor(company.status)}>
            {getStatusText(company.status)}
          </Badge>
          <div className="flex items-center gap-1">
            <TrendingUp className={`h-4 w-4 ${getEngagementColor(company.engagement_score)}`} />
            <span className={`text-sm font-medium ${getEngagementColor(company.engagement_score)}`}>
              {company.engagement_score}%
            </span>
          </div>
        </div>

        {/* Company Info */}
        <div className="space-y-2 mb-4">
          {company.company_size && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="capitalize">{company.company_size}</span>
              {company.employee_count && (
                <span>• {company.employee_count} empleados</span>
              )}
            </div>
          )}
          
          {company.contacts && company.contacts.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{company.contacts.length} contacto{company.contacts.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {company.last_interaction_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Última interacción {formatDistanceToNow(new Date(company.last_interaction_date), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Revenue */}
        {company.annual_revenue && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground">Ingresos anuales</p>
            <p className="font-semibold">
              ${company.annual_revenue.toLocaleString('es-MX')}
            </p>
          </div>
        )}

        {/* Primary Contacts */}
        {company.contacts && company.contacts.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">Contactos principales</p>
            <div className="flex -space-x-2">
              {company.contacts.slice(0, 3).map((contact: any, index: number) => (
                <Avatar key={contact.id} className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="text-xs">
                    {contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {company.contacts.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{company.contacts.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
