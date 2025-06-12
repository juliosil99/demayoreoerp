
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { CommunicationFilters } from './CommunicationFilters';

interface CommunicationsFiltersCardProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
}

export const CommunicationsFiltersCard = ({
  searchTerm,
  onSearchChange,
  selectedChannel,
  onChannelChange
}: CommunicationsFiltersCardProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <CommunicationFilters
            selectedChannel={selectedChannel}
            onChannelChange={onChannelChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
