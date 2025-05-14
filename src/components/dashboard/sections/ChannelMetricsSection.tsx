
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ChannelMetrics } from "@/types/dashboard";

interface ChannelMetricsSectionProps {
  channelMetrics: ChannelMetrics[];
}

export const ChannelMetricsSection = ({ channelMetrics }: ChannelMetricsSectionProps) => {
  if (!channelMetrics || channelMetrics.length === 0) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl">Métricas por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay datos disponibles para mostrar métricas por canal.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Métricas por Canal</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {channelMetrics.map((channel, index) => (
          <ChannelCard key={index} channel={channel} />
        ))}
      </div>
    </div>
  );
};

interface ChannelCardProps {
  channel: ChannelMetrics;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{channel.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <MetricItem 
            label="Ingresos" 
            value={formatCurrency(channel.revenue)}
            changeValue={channel.revenueChange}
          />
          <MetricItem 
            label="Órdenes" 
            value={channel.orders.toString()}
            changeValue={channel.ordersChange}
          />
          <MetricItem 
            label="AOV" 
            value={formatCurrency(channel.aov)}
            changeValue={channel.aovChange}
          />
          <MetricItem 
            label="Contribución" 
            value={formatCurrency(channel.contributionMargin)}
            changeValue={channel.contributionMarginChange}
          />
          <MetricItem 
            label="Margen %" 
            value={`${channel.marginPercentage.toFixed(2)}%`}
            changeValue={channel.marginPercentageChange}
            className="col-span-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricItemProps {
  label: string;
  value: string;
  changeValue: number;
  className?: string;
}

const MetricItem = ({ label, value, changeValue, className }: MetricItemProps) => {
  const changeType = changeValue > 0 ? "positive" : changeValue < 0 ? "negative" : "neutral";
  
  return (
    <div className={className}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="flex items-center mt-1">
        {changeType === "positive" ? (
          <ArrowUp className="w-3 h-3 mr-1 text-green-500" />
        ) : changeType === "negative" ? (
          <ArrowDown className="w-3 h-3 mr-1 text-red-500" />
        ) : null}
        <span 
          className={`text-xs font-medium ${
            changeType === "positive" ? "text-green-500" : 
            changeType === "negative" ? "text-red-500" : 
            "text-gray-500"
          }`}
        >
          {changeValue > 0 ? "+" : ""}{changeValue.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
