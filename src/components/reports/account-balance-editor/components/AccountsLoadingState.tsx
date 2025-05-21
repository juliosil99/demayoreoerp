
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AccountsLoadingState: React.FC = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
};
