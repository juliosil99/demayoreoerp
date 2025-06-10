
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Pause, Settings, Zap, ArrowRight, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type Workflow = Tables<'workflows'>;

interface WorkflowFormData {
  name: string;
  description: string;
  trigger_type: 'opportunity_created' | 'stage_changed' | 'time_based' | 'manual';
  trigger_conditions: string;
}

export const WorkflowBuilder = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { register, handleSubmit, reset, setValue } = useForm<WorkflowFormData>();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async (): Promise<Workflow[]> => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: WorkflowFormData) => {
      const { error } = await supabase
        .from('workflows')
        .insert({
          name: data.name,
          description: data.description,
          trigger_type: data.trigger_type,
          trigger_conditions: JSON.parse(data.trigger_conditions || '{}'),
          actions: [],
          is_active: false,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow creado exitosamente');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error('Error al crear el workflow');
      console.error('Error creating workflow:', error);
    },
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Estado del workflow actualizado');
    },
  });

  const onSubmit = (data: WorkflowFormData) => {
    createWorkflowMutation.mutate(data);
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'opportunity_created': return <Plus className="h-4 w-4" />;
      case 'stage_changed': return <ArrowRight className="h-4 w-4" />;
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'manual': return <Play className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'opportunity_created': return 'Oportunidad Creada';
      case 'stage_changed': return 'Cambio de Etapa';
      case 'time_based': return 'Basado en Tiempo';
      case 'manual': return 'Manual';
      default: return type;
    }
  };

  // Predefined workflow templates
  const workflowTemplates = [
    {
      name: 'Seguimiento Automático',
      description: 'Crea seguimientos automáticos para nuevas oportunidades',
      trigger_type: 'opportunity_created' as const,
      actions: [
        { type: 'schedule_follow_up', delay_hours: 24 },
        { type: 'send_notification', delay_hours: 72 }
      ]
    },
    {
      name: 'Alerta de Oportunidad Estancada',
      description: 'Notifica cuando una oportunidad lleva mucho tiempo en la misma etapa',
      trigger_type: 'time_based' as const,
      actions: [
        { type: 'send_notification' },
        { type: 'create_task' }
      ]
    },
    {
      name: 'Bienvenida a Clientes',
      description: 'Envía email de bienvenida cuando se cierra una oportunidad',
      trigger_type: 'stage_changed' as const,
      actions: [
        { type: 'send_email' },
        { type: 'create_task' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Constructor de Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Automatiza tus procesos de ventas con workflows personalizados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Workflow</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input {...register('name', { required: true })} placeholder="Nombre del workflow" />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea {...register('description')} placeholder="Descripción del workflow" />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de trigger</label>
                <Select onValueChange={(value) => setValue('trigger_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity_created">Oportunidad Creada</SelectItem>
                    <SelectItem value="stage_changed">Cambio de Etapa</SelectItem>
                    <SelectItem value="time_based">Basado en Tiempo</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Condiciones (JSON)</label>
                <Textarea 
                  {...register('trigger_conditions')} 
                  placeholder='{"stage_id": "example"}'
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createWorkflowMutation.isPending}>
                  Crear
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Workflow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comienza con estas plantillas predefinidas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowTemplates.map((template, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {getTriggerLabel(template.trigger_type)}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Usar Plantilla
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Workflows Activos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay workflows configurados</p>
              <p className="text-sm">Crea tu primer workflow para automatizar procesos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${workflow.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {getTriggerIcon(workflow.trigger_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {getTriggerLabel(workflow.trigger_type)}
                        </Badge>
                        <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                          {workflow.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={workflow.is_active}
                      onCheckedChange={(checked) => 
                        toggleWorkflowMutation.mutate({ 
                          id: workflow.id, 
                          isActive: checked 
                        })
                      }
                    />
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {workflows.filter(w => w.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {workflows.filter(w => !w.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ejecuciones Hoy</p>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
