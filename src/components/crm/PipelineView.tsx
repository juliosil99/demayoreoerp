
import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useOpportunities, useUpdateOpportunity } from '@/hooks/useOpportunities';
import { Opportunity } from '@/types/pipeline';
import { OpportunityDialog } from './OpportunityDialog';
import { DroppableStageColumn } from './pipeline/DroppableStageColumn';
import { PipelineFilters, PipelineFilterState } from './pipeline/PipelineFilters';
import { PipelineMetrics } from './pipeline/PipelineMetrics';
import { toast } from 'sonner';

export const PipelineView = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [filters, setFilters] = useState<PipelineFilterState>({
    search: '',
    minValue: 0,
    maxValue: 1000000,
    minProbability: 0,
    companyId: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages();
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useOpportunities();
  const updateOpportunity = useUpdateOpportunity();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = allOpportunities.filter(opp => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(searchLower);
        const matchesCompany = opp.company?.name.toLowerCase().includes(searchLower) || false;
        const matchesContact = opp.contact?.name.toLowerCase().includes(searchLower) || false;
        
        if (!matchesTitle && !matchesCompany && !matchesContact) {
          return false;
        }
      }

      // Value range filter
      if (opp.value < filters.minValue || opp.value > filters.maxValue) {
        return false;
      }

      // Probability filter
      if (opp.probability < filters.minProbability) {
        return false;
      }

      // Company filter
      if (filters.companyId && opp.company_id !== filters.companyId) {
        return false;
      }

      return true;
    });

    // Sort opportunities
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'probability':
          aValue = a.probability;
          bValue = b.probability;
          break;
        case 'expected_close_date':
          aValue = a.expected_close_date ? new Date(a.expected_close_date) : new Date(0);
          bValue = b.expected_close_date ? new Date(b.expected_close_date) : new Date(0);
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allOpportunities, filters]);

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setIsDialogOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDialogOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const opportunityId = active.id as string;
    const newStageId = over.id as string;
    
    // Find the opportunity being dragged
    const opportunity = allOpportunities.find(opp => opp.id === opportunityId);
    if (!opportunity || opportunity.stage_id === newStageId) return;

    try {
      // Optimistic update
      toast.loading('Actualizando oportunidad...');
      
      await updateOpportunity.mutateAsync({
        id: opportunityId,
        data: { stage_id: newStageId }
      });

      toast.dismiss();
      toast.success('Oportunidad movida exitosamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al mover la oportunidad');
      console.error('Error moving opportunity:', error);
    }
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return filteredOpportunities.filter(opp => opp.stage_id === stageId);
  };

  if (stagesLoading || opportunitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Ventas</h2>
          <p className="text-muted-foreground">
            Gestiona tus oportunidades con drag & drop y filtros avanzados
          </p>
        </div>
        <Button onClick={handleCreateOpportunity}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Oportunidad
        </Button>
      </div>

      {/* Filters */}
      <PipelineFilters
        filters={filters}
        onFiltersChange={setFilters}
        isCompact={isCompact}
        onCompactToggle={() => setIsCompact(!isCompact)}
      />

      {/* Metrics */}
      <PipelineMetrics opportunities={filteredOpportunities} stages={stages} />

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px]">
          {stages.map((stage) => {
            const stageOpportunities = getOpportunitiesByStage(stage.id);

            return (
              <DroppableStageColumn
                key={stage.id}
                stage={stage}
                opportunities={stageOpportunities}
                onOpportunityClick={handleEditOpportunity}
                isCompact={isCompact}
              />
            );
          })}
        </div>
      </DndContext>

      <OpportunityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        opportunity={selectedOpportunity}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedOpportunity(null);
        }}
      />
    </div>
  );
};
