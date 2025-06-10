
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PipelineStage, Opportunity } from '@/types/pipeline';
import { formatCurrency } from '@/utils/formatters';
import { DraggableOpportunityCard } from './DraggableOpportunityCard';
import { cn } from '@/lib/utils';

interface DroppableStageColumnProps {
  stage: PipelineStage;
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
  isCompact?: boolean;
}

export const DroppableStageColumn = ({ 
  stage, 
  opportunities, 
  onOpportunityClick,
  isCompact = false 
}: DroppableStageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const stageTotal = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const opportunityIds = opportunities.map(opp => opp.id);

  return (
    <div className="space-y-4">
      {/* Stage Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {stage.name}
            </CardTitle>
            <Badge 
              variant="outline" 
              style={{ borderColor: stage.color, color: stage.color }}
            >
              {opportunities.length}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Total: {formatCurrency(stageTotal)}
          </div>
        </CardHeader>
      </Card>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[400px] space-y-3 p-2 rounded-lg transition-colors",
          isOver && "bg-primary/5 border-2 border-primary/20 border-dashed"
        )}
      >
        <SortableContext items={opportunityIds} strategy={verticalListSortingStrategy}>
          {opportunities.map((opportunity) => (
            <DraggableOpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onClick={() => onOpportunityClick(opportunity)}
              isCompact={isCompact}
            />
          ))}
        </SortableContext>

        {opportunities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No hay oportunidades</div>
            <div className="text-xs">en esta etapa</div>
          </div>
        )}
      </div>
    </div>
  );
};
