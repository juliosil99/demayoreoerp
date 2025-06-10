
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type FollowUp = Tables<'follow_ups'> & {
  opportunities?: { id: string; title: string } | null;
  companies_crm?: { id: string; name: string } | null;
  contacts?: { id: string; name: string } | null;
};

interface FollowUpFormData {
  title: string;
  description: string;
  due_date: Date;
  priority: 'low' | 'medium' | 'high';
  opportunity_id: string;
  company_id: string;
  contact_id: string;
  reminder_type: 'email' | 'notification' | 'both';
}

export const FollowUpReminders = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch } = useForm<FollowUpFormData>();

  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['follow-ups'],
    queryFn: async (): Promise<FollowUp[]> => {
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          opportunities(id, title),
          companies_crm(id, name),
          contacts(id, name)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: async (data: FollowUpFormData) => {
      const { error } = await supabase
        .from('follow_ups')
        .insert({
          title: data.title,
          description: data.description,
          due_date: data.due_date.toISOString(),
          priority: data.priority,
          opportunity_id: data.opportunity_id || null,
          company_id: data.company_id || null,
          contact_id: data.contact_id || null,
          reminder_type: data.reminder_type,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      toast.success('Recordatorio creado exitosamente');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error('Error al crear el recordatorio');
      console.error('Error creating follow-up:', error);
    },
  });

  const completeFollowUpMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('follow_ups')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      toast.success('Recordatorio completado');
    },
  });

  const onSubmit = (data: FollowUpFormData) => {
    if (!selectedDate) {
      toast.error('Por favor selecciona una fecha');
      return;
    }
    createFollowUpMutation.mutate({ ...data, due_date: selectedDate });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    if (status === 'completed') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    
    const isOverdue = new Date(dueDate) < new Date() && status === 'pending';
    if (isOverdue) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    return <Clock className="h-4 w-4 text-orange-500" />;
  };

  const pendingFollowUps = followUps.filter(f => f.status === 'pending');
  const overdueFollowUps = pendingFollowUps.filter(f => new Date(f.due_date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recordatorios y Seguimientos</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus tareas pendientes y seguimientos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Recordatorio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input {...register('title', { required: true })} placeholder="Título del recordatorio" />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea {...register('description')} placeholder="Detalles del recordatorio" />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha de vencimiento</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium">Prioridad</label>
                <Select onValueChange={(value) => setValue('priority', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de recordatorio</label>
                <Select onValueChange={(value) => setValue('reminder_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification">Solo notificación</SelectItem>
                    <SelectItem value="email">Solo email</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createFollowUpMutation.isPending}>
                  Crear
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingFollowUps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{overdueFollowUps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {followUps.filter(f => f.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Recordatorios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando recordatorios...</div>
          ) : followUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay recordatorios registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followUps.map((followUp) => (
                <div 
                  key={followUp.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(followUp.status, followUp.due_date)}
                    <div className="flex-1">
                      <h4 className="font-medium">{followUp.title}</h4>
                      {followUp.description && (
                        <p className="text-sm text-muted-foreground">{followUp.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getPriorityColor(followUp.priority)}>
                          {followUp.priority === 'high' ? 'Alta' : 
                           followUp.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(followUp.due_date), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {followUp.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => completeFollowUpMutation.mutate(followUp.id)}
                      disabled={completeFollowUpMutation.isPending}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
