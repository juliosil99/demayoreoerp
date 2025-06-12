
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface CommunicationFiltersProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
}

export const CommunicationFilters = ({
  selectedChannel,
  onChannelChange
}: CommunicationFiltersProps) => {
  const channels = [
    { value: 'all', label: 'Todos los Canales', color: 'bg-gray-100 text-gray-800' },
    { value: 'mercadolibre_question', label: 'MercadoLibre', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'email', label: 'Email', color: 'bg-blue-100 text-blue-800' },
    { value: 'call', label: 'Llamadas', color: 'bg-green-100 text-green-800' },
    { value: 'meeting', label: 'Reuniones', color: 'bg-purple-100 text-purple-800' },
    { value: 'note', label: 'Notas', color: 'bg-gray-100 text-gray-800' },
    { value: 'task', label: 'Tareas', color: 'bg-orange-100 text-orange-800' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Canal</Label>
        <Select value={selectedChannel} onValueChange={onChannelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar canal" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.value} value={channel.value}>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${channel.color}`}>
                    {channel.label}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Estado</Label>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="follow_up">Seguimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Período</Label>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Todas las fechas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="yesterday">Ayer</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
