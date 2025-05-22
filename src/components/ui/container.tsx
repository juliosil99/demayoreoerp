
import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div 
        className={cn("container mx-auto", className)} 
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = "Container"
