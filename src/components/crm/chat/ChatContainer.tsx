
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Search, Filter, Plus } from 'lucide-react';
import { useCrmCompanies } from '@/hooks/useCrmCompanies';
import { ChatView } from './ChatView';

export const ChatContainer = () => {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: companies = [] } = useCrmCompanies();

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastInteractionTime = (company: any) => {
    if (!company.interactions || company.interactions.length === 0) return 'Sin interacciones';
    const lastInteraction = company.interactions[0];
    return new Date(lastInteraction.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnreadCount = (company: any) => {
    // Simulated unread count - in real app would come from database
    return Math.floor(Math.random() * 3);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Companies List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversaciones
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="space-y-1 p-4">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron empresas</p>
                </div>
              ) : (
                filteredCompanies.map((company) => {
                  const unreadCount = getUnreadCount(company);
                  return (
                    <div
                      key={company.id}
                      onClick={() => setSelectedCompany(company)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCompany?.id === company.id
                          ? 'bg-primary/10 border-primary/20 border'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{company.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {getLastInteractionTime(company)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {company.status === 'customer' ? 'Cliente' : 
                             company.status === 'prospect' ? 'Prospecto' : 
                             company.status}
                          </Badge>
                          {unreadCount > 0 && (
                            <Badge variant="default" className="text-xs bg-red-500">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {selectedCompany ? (
          <ChatView
            companyId={selectedCompany.id}
            companyName={selectedCompany.name}
          />
        ) : (
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Elige una empresa de la lista para iniciar o continuar una conversación
              </p>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Conversación
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
