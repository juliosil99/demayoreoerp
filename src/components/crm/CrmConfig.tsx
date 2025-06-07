
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, X } from 'lucide-react';

interface ConfigItem {
  id: string;
  name: string;
  color?: string;
}

export const CrmConfig = () => {
  const [industries, setIndustries] = useState<ConfigItem[]>([
    { id: '1', name: 'Tecnología' },
    { id: '2', name: 'Manufactura' },
    { id: '3', name: 'Servicios' },
    { id: '4', name: 'Retail' },
    { id: '5', name: 'Salud' },
  ]);

  const [companyStatuses] = useState<ConfigItem[]>([
    { id: '1', name: 'Prospecto', color: 'blue' },
    { id: '2', name: 'Cliente', color: 'green' },
    { id: '3', name: 'Activo', color: 'emerald' },
    { id: '4', name: 'Inactivo', color: 'gray' },
    { id: '5', name: 'Perdido', color: 'red' },
  ]);

  const [companySizes] = useState<ConfigItem[]>([
    { id: '1', name: 'Startup' },
    { id: '2', name: 'Pequeña' },
    { id: '3', name: 'Mediana' },
    { id: '4', name: 'Grande' },
    { id: '5', name: 'Empresa' },
  ]);

  const [newIndustry, setNewIndustry] = useState('');

  const addIndustry = () => {
    if (newIndustry.trim()) {
      setIndustries([
        ...industries,
        { id: Date.now().toString(), name: newIndustry.trim() }
      ]);
      setNewIndustry('');
    }
  };

  const removeIndustry = (id: string) => {
    setIndustries(industries.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Configuración CRM</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industries Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Industrias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nueva industria..."
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIndustry()}
              />
              <Button onClick={addIndustry} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge key={industry.id} variant="secondary" className="flex items-center gap-1">
                  {industry.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeIndustry(industry.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Statuses */}
        <Card>
          <CardHeader>
            <CardTitle>Estados de Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {companyStatuses.map((status) => (
                <Badge key={status.id} variant="outline">
                  {status.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Tamaños de Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {companySizes.map((size) => (
                <Badge key={size.id} variant="outline">
                  {size.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Interacción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Email', 'Llamada', 'Reunión', 'Nota', 'Tarea'].map((type) => (
                <Badge key={type} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
