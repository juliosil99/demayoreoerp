
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MetricItemProps {
  title: string;
  value: string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
}

interface MetricGroupProps {
  title: string;
  metrics: MetricItemProps[];
}

export const MetricGroup = ({ title, metrics }: MetricGroupProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {metric.title}
              </div>
              <div className="text-2xl font-bold">
                {metric.value}
              </div>
              {metric.change !== undefined && (
                <div className="flex items-center mt-1">
                  {metric.changeType === "positive" ? (
                    <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                  ) : metric.changeType === "negative" ? (
                    <ArrowDown className="w-4 h-4 mr-1 text-red-500" />
                  ) : null}
                  <span 
                    className={`text-xs font-medium ${
                      metric.changeType === "positive" ? "text-green-500" : 
                      metric.changeType === "negative" ? "text-red-500" : 
                      "text-gray-500"
                    }`}
                  >
                    {metric.change > 0 ? "+" : ""}{metric.change?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
