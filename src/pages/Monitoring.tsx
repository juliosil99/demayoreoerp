
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EgressDashboard } from '@/components/monitoring/EgressDashboard';
import { RealEgressDashboard } from '@/components/monitoring/RealEgressDashboard';
import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard';
import { EgressAnalysisPanel } from '@/components/monitoring/EgressAnalysisPanel';
import { Activity, Database, Zap, BarChart3 } from 'lucide-react';

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema de Monitoreo</h1>
        <p className="text-muted-foreground">
          Monitoreo en tiempo real de Egress y Performance del sistema
        </p>
      </div>

      <Tabs defaultValue="real-egress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="real-egress" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Monitor Real de Egress
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis de Consultas
          </TabsTrigger>
          <TabsTrigger value="egress" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Monitor Legacy
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="real-egress">
          <RealEgressDashboard />
        </TabsContent>
        
        <TabsContent value="analysis">
          <EgressAnalysisPanel />
        </TabsContent>
        
        <TabsContent value="egress">
          <EgressDashboard />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
