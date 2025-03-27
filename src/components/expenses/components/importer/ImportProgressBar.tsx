
import { Progress } from "@/components/ui/progress";

interface ImportProgressBarProps {
  progress: number;
  totalExpenses: number;
  isUploading: boolean;
}

export function ImportProgressBar({ progress, totalExpenses, isUploading }: ImportProgressBarProps) {
  if (!isUploading || totalExpenses === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Importando gastos...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
