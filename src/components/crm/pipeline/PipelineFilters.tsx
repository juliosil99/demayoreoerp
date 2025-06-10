
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { useCrmCompanies } from '@/hooks/useCrmCompanies';

export interface PipelineFilterState {
  search: string;
  minValue: number;
  maxValue: number;
  minProbability: number;
  companyId: string;
  sortBy: 'value' | 'probability' | 'created_at' | 'expected_close_date';
  sortOrder: 'asc' | 'desc';
}

interface PipelineFiltersProps {
  filters: PipelineFilterState;
  onFiltersChange: (filters: PipelineFilterState) => void;
  isCompact: boolean;
  onCompactToggle: () => void;
}

export const PipelineFilters = ({ 
  filters, 
  onFiltersChange, 
  isCompact, 
  onCompactToggle 
}: PipelineFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: companies = [] } = useCrmCompanies();

  const updateFilter = (key: keyof PipelineFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      minValue: 0,
      maxValue: 1000000,
      minProbability: 0,
      companyId: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.minValue > 0 || 
    filters.maxValue < 1000000 || 
    filters.minProbability > 0 || 
    filters.companyId;

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar oportunidades..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Sort */}
      <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="value">Valor</SelectItem>
          <SelectItem value="probability">Probabilidad</SelectItem>
          <SelectItem value="created_at">Fecha creación</SelectItem>
          <SelectItem value="expected_close_date">Fecha cierre</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {filters.sortOrder === 'asc' ? '↑' : '↓'}
      </Button>

      {/* Advanced Filters */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avanzados</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Value Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rango de Valor</label>
            <Slider
              value={[filters.minValue, filters.maxValue]}
              onValueChange={([min, max]) => {
                updateFilter('minValue', min);
                updateFilter('maxValue', max);
              }}
              min={0}
              max={1000000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${filters.minValue.toLocaleString()}</span>
              <span>${filters.maxValue.toLocaleString()}</span>
            </div>
          </div>

          {/* Probability */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Probabilidad Mínima</label>
            <Slider
              value={[filters.minProbability]}
              onValueChange={([value]) => updateFilter('minProbability', value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {filters.minProbability}% o más
            </div>
          </div>

          {/* Company Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Empresa</label>
            <Select value={filters.companyId} onValueChange={(value) => updateFilter('companyId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      {/* View Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCompactToggle}
      >
        {isCompact ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
      </Button>
    </div>
  );
};
