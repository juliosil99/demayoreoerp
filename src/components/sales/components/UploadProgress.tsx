
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  currentFile: string;
}

export function UploadProgress({ progress, currentFile }: UploadProgressProps) {
  if (progress === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Procesando: {currentFile}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
