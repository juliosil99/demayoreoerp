
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Calendar, GripVertical } from 'lucide-react';
import { Opportunity } from '@/types/pipeline';
import { formatCurrency } from '@/utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DraggableOpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
  isCompact?: boolean;
}

export const DraggableOpportunityCard = ({ 
  opportunity, 
  onClick, 
  isCompact = false 
}: DraggableOpportunityCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200",
        isDragging && "opacity-50 shadow-lg scale-105 rotate-2",
        "group relative"
      )}
      onClick={onClick}
    >
      <CardContent className={cn("p-3", isCompact && "p-2")}>
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h4 className={cn(
            "font-medium line-clamp-2",
            isCompact ? "text-sm" : "text-sm"
          )}>
            {opportunity.title}
          </h4>
          
          <div className={cn(
            "font-bold text-green-600",
            isCompact ? "text-base" : "text-lg"
          )}>
            {formatCurrency(opportunity.value)}
          </div>

          {!isCompact && (
            <>
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
            </>
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

          {!isCompact && opportunity.expected_close_date && (
            <div className="text-xs text-orange-600">
              Cierre: {new Date(opportunity.expected_close_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
