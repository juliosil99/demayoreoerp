
import { Skeleton } from "@/components/ui/skeleton";

export function AccountSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-60" />
      <Skeleton className="h-8 w-96" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
