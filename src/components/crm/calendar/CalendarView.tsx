
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus, Clock, User, Target, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatDatetime } from '@/utils/formatters';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type CalendarEvent = Tables<'calendar_events'> & {
  opportunities?: { id: string; title: string } | null;
  companies_crm?: { id: string; name: string } | null;
  contacts?: { id: string; name: string } | null;
};

interface EventFormData {
  title: string;
  description: string;
  event_type: 'meeting' | 'call' | 'task' | 'follow_up' | 'demo';
  start_date: string;
  end_date: string;
  location: string;
  opportunity_id: string;
  company_id: string;
  contact_id: string;
}

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { register, handleSubmit, reset, setValue } = useForm<EventFormData>();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', selectedDate.getMonth(), selectedDate.getFullYear()],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          opportunities(id, title),
          companies_crm(id, name),
          contacts(id, name)
        `)
        .gte('start_date', startOfMonth.toISOString())
        .lte('start_date', endOfMonth.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          title: data.title,
          description: data.description,
          event_type: data.event_type,
          start_date: data.start_date,
          end_date: data.end_date,
          location: data.location || null,
          opportunity_id: data.opportunity_id || null,
          company_id: data.company_id || null,
          contact_id: data.contact_id || null,
          status: 'scheduled',
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Evento creado exitosamente');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error('Error al crear el evento');
      console.error('Error creating event:', error);
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('calendar_events')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Estado del evento actualizado');
    },
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <User className="h-4 w-4" />;
      case 'call': return <Clock className="h-4 w-4" />;
      case 'task': return <Target className="h-4 w-4" />;
      case 'demo': return <Target className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'task': return 'bg-purple-500';
      case 'demo': return 'bg-orange-500';
      case 'follow_up': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const eventsForSelectedDate = events.filter(event => {
    const eventDate = new Date(event.start_date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const upcomingEvents = events
    .filter(event => new Date(event.start_date) >= new Date() && event.status === 'scheduled')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Calendario de Actividades</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus reuniones, llamadas y tareas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input {...register('title', { required: true })} placeholder="Título del evento" />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de evento</label>
                <Select onValueChange={(value) => setValue('event_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="call">Llamada</SelectItem>
                    <SelectItem value="task">Tarea</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="follow_up">Seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea {...register('description')} placeholder="Detalles del evento" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Inicio</label>
                  <Input 
                    type="datetime-local" 
                    {...register('start_date', { required: true })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fin</label>
                  <Input 
                    type="datetime-local" 
                    {...register('end_date', { required: true })} 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Ubicación</label>
                <Input {...register('location')} placeholder="Ubicación o enlace" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  Crear
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Eventos - {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay eventos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-1 rounded ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start_date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {event.location && (
                          <span className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {event.status === 'scheduled' ? 'Programado' :
                         event.status === 'completed' ? 'Completado' : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay eventos próximos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDatetime(event.start_date)}
                      </p>
                      {event.companies_crm?.name && (
                        <p className="text-xs text-muted-foreground">
                          {event.companies_crm.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateEventStatusMutation.mutate({
                        id: event.id,
                        status: 'completed'
                      })}
                    >
                      Completar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateEventStatusMutation.mutate({
                        id: event.id,
                        status: 'cancelled'
                      })}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
