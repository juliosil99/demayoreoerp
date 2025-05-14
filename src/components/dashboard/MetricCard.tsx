
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  changeType?: "positive" | "negative" | "neutral";
  count?: number;
  countLabel?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change,
  changeLabel = "desde el último periodo",
  changeType = "neutral",
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
        
        {change !== undefined && (
          <div className="mt-2 flex items-center text-xs">
            <span 
              className={cn(
                "mr-1 rounded-md px-1.5 py-0.5 font-medium",
                changeType === "positive" && "bg-emerald-100 text-emerald-800",
                changeType === "negative" && "bg-rose-100 text-rose-800",
                changeType === "neutral" && "bg-gray-100 text-gray-800"
              )}
            >
              {change > 0 ? "+" : ""}{change.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        )}
        
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
