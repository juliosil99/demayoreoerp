
import { Skeleton } from "@/components/ui/skeleton";

export const ConversationListSkeleton = () => (
  <div className="py-4 space-y-2">
    {[...Array(10)].map((_, i) => (
      <Skeleton key={i} className="h-20 rounded-lg mx-3" />
    ))}
  </div>
);
