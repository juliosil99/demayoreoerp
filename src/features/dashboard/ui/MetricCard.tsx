
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  count?: number;
  countLabel?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  count,
  countLabel,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {count !== undefined && countLabel && (
          <p className="text-xs text-muted-foreground">
            {count} {countLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
