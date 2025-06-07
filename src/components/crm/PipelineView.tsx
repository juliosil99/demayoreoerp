
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, User, Calendar } from 'lucide-react';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useOpportunities, useUpdateOpportunity } from '@/hooks/useOpportunities';
import { Opportunity } from '@/types/pipeline';
import { formatCurrency } from '@/utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OpportunityDialog } from './OpportunityDialog';

export const PipelineView = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages();
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useOpportunities();
  const updateOpportunity = useUpdateOpportunity();

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setIsDialogOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDialogOpen(true);
  };

  const handleStageChange = async (opportunityId: string, newStageId: string) => {
    await updateOpportunity.mutateAsync({
      id: opportunityId,
      data: { stage_id: newStageId }
    });
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage_id === stageId);
  };

  const getStageTotal = (stageId: string) => {
    return getOpportunitiesByStage(stageId).reduce((sum, opp) => sum + opp.value, 0);
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
            Gestiona tus oportunidades de venta por etapas
          </p>
        </div>
        <Button onClick={handleCreateOpportunity}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Oportunidad
        </Button>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px]">
        {stages.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.id);
          const stageTotal = getStageTotal(stage.id);

          return (
            <div key={stage.id} className="space-y-4">
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
                      {stageOpportunities.length}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total: {formatCurrency(stageTotal)}
                  </div>
                </CardHeader>
              </Card>

              {/* Opportunities in this stage */}
              <div className="space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <Card 
                    key={opportunity.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleEditOpportunity(opportunity)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {opportunity.title}
                        </h4>
                        
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(opportunity.value)}
                        </div>

                        {opportunity.company && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{opportunity.company.name}</span>
                          </div>
                        )}

                        {opportunity.contact && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{opportunity.contact.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(opportunity.created_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {opportunity.probability}%
                          </Badge>
                        </div>

                        {opportunity.expected_close_date && (
                          <div className="text-xs text-orange-600">
                            Cierre estimado: {new Date(opportunity.expected_close_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {stageOpportunities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">No hay oportunidades</div>
                    <div className="text-xs">en esta etapa</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
