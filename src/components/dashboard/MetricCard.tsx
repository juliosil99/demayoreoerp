
import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  count?: number;
  countLabel?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  count, 
  countLabel = "registros" 
}: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {count !== undefined && (
          <div className="mt-1 text-xs text-muted-foreground flex items-center">
            <span className="font-medium text-primary">{count}</span>
            <span className="ml-1">{countLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
