
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { toast } from "sonner";
import type { DownloadTask } from "./types";

export const processDownloadQueue = async (
  tasks: DownloadTask[],
  onLog: (message: string) => void,
  onProgressUpdate: (current: number, total: number) => void
): Promise<boolean> => {
  onLog(`Starting download queue processing with ${tasks.length} tasks`);
  const total = tasks.length;
  onProgressUpdate(0, total);
  
  let allSuccessful = true;
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const currentIndex = i + 1;
    
    onLog(`Processing task ${currentIndex}/${total}: ${task.id}`);
    onProgressUpdate(currentIndex, total);
    
    // Show progress toast for multiple tasks
    if (total > 1) {
      toast.info(`Procesando tarea ${currentIndex} de ${total}`, {
        id: `download-progress-${i}`,
        duration: 3000,
      });
    }
    
    try {
      // Execute the task
      onLog(`Executing task ${task.id}`);
      await task.task();
      onLog(`Successfully completed task ${currentIndex}/${total}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      onLog(`Error executing task ${currentIndex}/${total}: ${errorMessage}`);
      allSuccessful = false;
    }
    
    // Add delay between tasks (only if there are more tasks)
    if (i < tasks.length - 1) {
      onLog(`Adding delay of 3 seconds between tasks (task ${currentIndex}/${total})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      onLog(`Delay completed, continuing to next task`);
    }
  }
  
  onLog(`Task queue processing completed. All successful: ${allSuccessful}`);
  return allSuccessful;
};
