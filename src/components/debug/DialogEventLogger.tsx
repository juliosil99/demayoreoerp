
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { dialogLogger } from "@/utils/dialogLogger";

export function DialogEventLogger() {
  const [log, setLog] = useState('');
  const [eventsCount, setEventsCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isOpen) {
        setLog(dialogLogger.getEventsAsText());
      }
      setEventsCount(dialogLogger.getEvents().length);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isOpen]);

  const handleClearEvents = () => {
    dialogLogger.clearEvents();
    setLog('');
    setEventsCount(0);
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(log).then(() => {
      alert('Log copiado al portapapeles');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          className="fixed bottom-4 right-4 z-50 bg-white"
        >
          Debug Logs 
          <Badge variant="secondary" className="ml-2">{eventsCount}</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Registro de Eventos de Diálogos</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] w-full border rounded-md p-4 bg-gray-50">
          <pre className="text-xs font-mono">
            {log || 'No hay eventos registrados aún...'}
          </pre>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClearEvents}>
            Limpiar Log
          </Button>
          <Button variant="outline" onClick={handleCopyToClipboard}>
            Copiar al Portapapeles
          </Button>
          <DialogClose asChild>
            <Button>Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
