
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReconciliationSkeleton() {
  return (
    <div className="space-y-4 max-w-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-2 sm:px-0">Gastos sin Conciliar</h3>
        
        {/* Grid de skeleton cards */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-18" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
              
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
