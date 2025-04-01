
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { toast } from "sonner";
import type { DownloadItem } from "./types";

export const processDownloadQueue = async (
  items: DownloadItem[],
  onLog: (message: string) => void,
  onProgressUpdate: (current: number, total: number) => void
): Promise<boolean> => {
  onLog(`Starting download queue processing with ${items.length} items`);
  const total = items.length;
  onProgressUpdate(0, total);
  
  let allSuccessful = true;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const currentIndex = i + 1;
    
    onLog(`Processing download ${currentIndex}/${total}: ${item.fileName} (${item.filePath})`);
    onProgressUpdate(currentIndex, total);
    
    // Show progress toast for multiple files
    if (total > 1) {
      toast.info(`Descargando archivo ${currentIndex} de ${total}: ${item.fileName}`, {
        id: `download-progress-${i}`,
        duration: 3000,
      });
    }
    
    try {
      // Download the file
      onLog(`Calling downloadInvoiceFile for ${item.filePath}`);
      const success = await downloadInvoiceFile(
        item.filePath,
        item.fileName,
        item.contentType
      );
      
      if (success) {
        onLog(`Successfully downloaded file ${currentIndex}/${total}`);
      } else {
        onLog(`Failed to download file ${currentIndex}/${total}`);
        allSuccessful = false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      onLog(`Error downloading file ${currentIndex}/${total}: ${errorMessage}`);
      allSuccessful = false;
    }
    
    // Add delay between downloads (only if there are more files)
    if (i < items.length - 1) {
      onLog(`Adding delay of 3 seconds between downloads (item ${currentIndex}/${total})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      onLog(`Delay completed, continuing to next download`);
    }
  }
  
  onLog(`Download queue processing completed. All successful: ${allSuccessful}`);
  return allSuccessful;
};
