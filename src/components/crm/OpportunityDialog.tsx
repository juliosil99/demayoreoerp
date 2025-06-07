
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/hooks/useOpportunities';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useCrmCompanies } from '@/hooks/useCrmCompanies';
import { Opportunity, OpportunityFormData } from '@/types/pipeline';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface OpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity | null;
  onClose: () => void;
}

export const OpportunityDialog = ({ open, onOpenChange, opportunity, onClose }: OpportunityDialogProps) => {
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    value: '',
    currency: 'MXN',
    company_id: '',
    contact_id: '',
    stage_id: '',
    probability: 50,
    expected_close_date: '',
    source: '',
  });

  const { data: stages = [] } = usePipelineStages();
  const { data: companies = [] } = useCrmCompanies();
  const createOpportunity = useCreateOpportunity();
  const updateOpportunity = useUpdateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();

  const isEditing = !!opportunity;

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title,
        description: opportunity.description || '',
        value: opportunity.value.toString(),
        currency: opportunity.currency,
        company_id: opportunity.company_id || '',
        contact_id: opportunity.contact_id || '',
        stage_id: opportunity.stage_id,
        probability: opportunity.probability,
        expected_close_date: opportunity.expected_close_date || '',
        source: opportunity.source || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        value: '',
        currency: 'MXN',
        company_id: '',
        contact_id: '',
        stage_id: stages.length > 0 ? stages[0].id : '',
        probability: 50,
        expected_close_date: '',
        source: '',
      });
    }
  }, [opportunity, stages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.stage_id) {
      return;
    }

    try {
      if (isEditing && opportunity) {
        await updateOpportunity.mutateAsync({
          id: opportunity.id,
          data: formData
        });
      } else {
        await createOpportunity.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleDelete = async () => {
    if (opportunity) {
      try {
        await deleteOpportunity.mutateAsync(opportunity.id);
        onClose();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  const selectedCompany = companies.find(c => c.id === formData.company_id);
  const availableContacts = selectedCompany?.contacts || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nombre de la oportunidad"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalles de la oportunidad"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  company_id: value,
                  contact_id: '' // Reset contact when company changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact">Contacto</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}
                disabled={!formData.company_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar contacto" />
                </SelectTrigger>
                <SelectContent>
                  {availableContacts.map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Etapa *</Label>
              <Select
                value={formData.stage_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stage_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expected_close_date">Fecha de Cierre Estimada</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="probability">
                Probabilidad de Éxito: {formData.probability}%
              </Label>
              <Slider
                id="probability"
                min={0}
                max={100}
                step={5}
                value={[formData.probability]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, probability: value[0] }))}
                className="mt-2"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="source">Fuente</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                placeholder="¿De dónde viene esta oportunidad?"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              {isEditing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar oportunidad?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la oportunidad.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createOpportunity.isPending || updateOpportunity.isPending}
              >
                {isEditing ? 'Actualizar' : 'Crear'} Oportunidad
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
