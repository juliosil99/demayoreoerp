
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Mail, Phone, Linkedin, Star, User } from 'lucide-react';
import { Contact } from '@/types/crm';

interface ContactsTabProps {
  companyId: string;
  contacts: Contact[];
}

export const ContactsTab = ({ companyId, contacts }: ContactsTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'unqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'qualified': return 'Calificado';
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'unqualified': return 'No Calificado';
      default: return status;
    }
  };

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contactos</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Contacto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No hay contactos registrados</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Contacto
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contactos ({contacts.length})</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{contact.name}</h4>
                      {contact.is_primary_contact && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <Badge className={getStatusColor(contact.contact_status)}>
                        {getStatusText(contact.contact_status)}
                      </Badge>
                    </div>
                    
                    {contact.job_title && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {contact.job_title}
                        {contact.department && ` • ${contact.department}`}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.rfc}</span> {/* Using RFC as email for now */}
                      </div>
                      
                      {contact.linkedin_url && (
                        <a 
                          href={contact.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                    
                    {contact.engagement_score > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Engagement:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${contact.engagement_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{contact.engagement_score}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
