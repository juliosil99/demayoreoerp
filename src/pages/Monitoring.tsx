
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EgressDashboard } from '@/components/monitoring/EgressDashboard';
import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard';
import { Activity, Database } from 'lucide-react';

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema de Monitoreo</h1>
        <p className="text-muted-foreground">
          Monitoreo en tiempo real de Egress y Performance del sistema
        </p>
      </div>

      <Tabs defaultValue="egress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="egress" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Monitor de Egress
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor de Performance
          </TabsTrigger>
        </TabsList>
        
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
