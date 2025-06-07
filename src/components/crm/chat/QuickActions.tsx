
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  CheckSquare,
  MessageSquare
} from 'lucide-react';

interface QuickActionsProps {
  onQuickAction: (type: 'call' | 'email' | 'meeting' | 'note' | 'task') => void;
}

export const QuickActions = ({ onQuickAction }: QuickActionsProps) => {
  const quickActions = [
    { type: 'call' as const, icon: Phone, label: 'Llamada', color: 'text-green-600' },
    { type: 'email' as const, icon: Mail, label: 'Email', color: 'text-blue-600' },
    { type: 'meeting' as const, icon: Calendar, label: 'Reunión', color: 'text-purple-600' },
    { type: 'note' as const, icon: FileText, label: 'Nota', color: 'text-gray-600' },
    { type: 'task' as const, icon: CheckSquare, label: 'Tarea', color: 'text-orange-600' },
  ];

  return (
    <Card className="p-3 mb-4 border-dashed border-2 border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Acciones Rápidas</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.type}
              variant="ghost"
              size="sm"
              onClick={() => onQuickAction(action.type)}
              className={`flex items-center gap-1 ${action.color} hover:bg-gray-50`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};
