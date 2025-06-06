
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInteraction } from '@/hooks/useCrmInteractions';
import { Interaction } from '@/types/crm';

interface InteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  contactId?: string;
  interaction?: Interaction;
}

export const InteractionDialog = ({ open, onOpenChange, companyId, contactId, interaction }: InteractionDialogProps) => {
  const [formData, setFormData] = useState({
    type: interaction?.type || 'note',
    subject: interaction?.subject || '',
    description: interaction?.description || '',
    outcome: interaction?.outcome || '',
    next_follow_up: interaction?.next_follow_up ? interaction.next_follow_up.split('T')[0] : '',
    interaction_date: interaction?.interaction_date ? interaction.interaction_date.split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const createInteraction = useCreateInteraction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createInteraction.mutateAsync({
        ...formData,
        company_id: companyId,
        contact_id: contactId,
        interaction_date: new Date(formData.interaction_date).toISOString(),
        next_follow_up: formData.next_follow_up ? new Date(formData.next_follow_up).toISOString() : null,
      });
      
      onOpenChange(false);
      setFormData({
        type: 'note',
        subject: '',
        description: '',
        outcome: '',
        next_follow_up: '',
        interaction_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating interaction:', error);
    }
  };

  const interactionTypes = [
    { value: 'email', label: 'Email' },
    { value: 'call', label: 'Llamada' },
    { value: 'meeting', label: 'Reunión' },
    { value: 'note', label: 'Nota' },
    { value: 'task', label: 'Tarea' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Interacción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Interacción</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interaction_date">Fecha</Label>
              <Input
                id="interaction_date"
                type="date"
                value={formData.interaction_date}
                onChange={(e) => setFormData(prev => ({ ...prev, interaction_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Breve resumen de la interacción"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalles de la interacción..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="outcome">Resultado</Label>
            <Input
              id="outcome"
              value={formData.outcome}
              onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
              placeholder="¿Cuál fue el resultado?"
            />
          </div>

          <div>
            <Label htmlFor="next_follow_up">Próximo Seguimiento</Label>
            <Input
              id="next_follow_up"
              type="date"
              value={formData.next_follow_up}
              onChange={(e) => setFormData(prev => ({ ...prev, next_follow_up: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createInteraction.isPending}>
              {createInteraction.isPending ? 'Guardando...' : 'Crear Interacción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
