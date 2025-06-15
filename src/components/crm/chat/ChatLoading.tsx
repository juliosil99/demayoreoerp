
import { Card, CardContent } from '@/components/ui/card';

export const ChatLoading = () => {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando conversación...</p>
        </div>
      </CardContent>
    </Card>
  );
};
