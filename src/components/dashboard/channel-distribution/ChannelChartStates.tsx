
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ChartStateProps {
  title: string;
}

export const LoadingState = ({ title }: ChartStateProps) => {
  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ErrorState = ({ title }: ChartStateProps) => {
  return (
    <Card className="shadow-md border-destructive/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-destructive">Error al cargar los datos</div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EmptyState = ({ title }: ChartStateProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">No hay datos disponibles</div>
        </div>
      </CardContent>
    </Card>
  );
};
