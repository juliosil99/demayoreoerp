
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { InteractionDialog } from '@/components/crm/InteractionDialog';
import { CommunicationsHeader } from './CommunicationsHeader';
import { CommunicationsFiltersCard } from './CommunicationsFiltersCard';
import { CommunicationsList } from './CommunicationsList';
import { CommunicationsMetrics } from './CommunicationsMetrics';
import { CommunicationsEmptyState } from './CommunicationsEmptyState';

export const CommunicationsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);

  const { data: interactionsData, isLoading, error } = useCrmInteractions();
  const interactions = interactionsData?.pages.flat() || [];

  console.log('CommunicationsView - interactions count:', interactions.length);
  console.log('CommunicationsView - isLoading:', isLoading);
  console.log('CommunicationsView - error:', error);

  const filteredInteractions = interactions.filter(interaction => {
    const metadata = interaction.metadata || {};
    
    const matchesSearch = !searchTerm || 
      interaction.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChannel = selectedChannel === 'all' || interaction.type === selectedChannel;
    
    return matchesSearch && matchesChannel;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <CommunicationsHeader 
          totalCount={interactions.length} 
          onNewInteraction={() => setShowInteractionDialog(true)}
        />

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
        <CommunicationsHeader 
          totalCount={0} 
          onNewInteraction={() => {}}
        />

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasFilters = searchTerm !== '' || selectedChannel !== 'all';

  return (
    <div className="space-y-6">
      <CommunicationsHeader 
        totalCount={interactions.length} 
        onNewInteraction={() => setShowInteractionDialog(true)}
      />

      <CommunicationsFiltersCard
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Interacciones ({filteredInteractions.length})
            </CardTitle>
            <CommunicationsMetrics interactions={filteredInteractions} />
          </div>
        </CardHeader>
        <CardContent>
          {filteredInteractions.length === 0 ? (
            <CommunicationsEmptyState 
              hasFilters={hasFilters}
              onNewInteraction={() => setShowInteractionDialog(true)}
            />
          ) : (
            <CommunicationsList interactions={filteredInteractions} />
          )}
        </CardContent>
      </Card>

      <InteractionDialog
        open={showInteractionDialog}
        onOpenChange={setShowInteractionDialog}
      />
    </div>
  );
};
