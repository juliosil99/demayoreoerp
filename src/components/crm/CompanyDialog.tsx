import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCrmCompanies';
import { Company, CompanyFormData } from '@/types/crm';

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
}

export const CompanyDialog = ({ open, onOpenChange, company }: CompanyDialogProps) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: company?.name || '',
    industry: company?.industry || '',
    company_size: company?.company_size || '',
    website: company?.website || '',
    description: company?.description || '',
    headquarters_location: company?.headquarters_location || '',
    founded_year: company?.founded_year || '',
    employee_count: company?.employee_count || '',
    annual_revenue: company?.annual_revenue || '',
    status: company?.status || 'prospect'
  });

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      founded_year: formData.founded_year ? parseInt(formData.founded_year.toString()) : null,
      employee_count: formData.employee_count ? parseInt(formData.employee_count.toString()) : null,
      annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue.toString()) : null,
    };

    try {
      if (company) {
        await updateCompany.mutateAsync({ ...data, id: company.id });
      } else {
        await createCompany.mutateAsync(data);
      }
      onOpenChange(false);
      setFormData({
        name: '',
        industry: '',
        company_size: '',
        website: '',
        description: '',
        headquarters_location: '',
        founded_year: '',
        employee_count: '',
        annual_revenue: '',
        status: 'prospect'
      });
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const isLoading = createCompany.isPending || updateCompany.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre de la Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="industry">Industria</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="ej. Tecnología, Retail, Manufactura"
              />
            </div>

            <div>
              <Label htmlFor="company_size">Tamaño de Empresa</Label>
              <Select 
                value={formData.company_size} 
                onValueChange={(value: CompanyFormData['company_size']) => 
                  setFormData(prev => ({ ...prev, company_size: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="small">Pequeña (1-50)</SelectItem>
                  <SelectItem value="medium">Mediana (51-200)</SelectItem>
                  <SelectItem value="large">Grande (201-1000)</SelectItem>
                  <SelectItem value="enterprise">Empresa (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: CompanyFormData['status']) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospecto</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="churned">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="headquarters_location">Ubicación</Label>
              <Input
                id="headquarters_location"
                value={formData.headquarters_location}
                onChange={(e) => setFormData(prev => ({ ...prev, headquarters_location: e.target.value }))}
                placeholder="Ciudad, País"
              />
            </div>

            <div>
              <Label htmlFor="founded_year">Año de Fundación</Label>
              <Input
                id="founded_year"
                type="number"
                value={formData.founded_year}
                onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value }))}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <Label htmlFor="employee_count">Número de Empleados</Label>
              <Input
                id="employee_count"
                type="number"
                value={formData.employee_count}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_count: e.target.value }))}
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="annual_revenue">Ingresos Anuales (MXN)</Label>
              <Input
                id="annual_revenue"
                type="number"
                value={formData.annual_revenue}
                onChange={(e) => setFormData(prev => ({ ...prev, annual_revenue: e.target.value }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descripción de la empresa..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (company ? 'Actualizar' : 'Crear Empresa')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
