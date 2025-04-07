
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL = "https://dulmmxtkgqkcfovvfxzu.supabase.co";

interface OpenAIKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenAIKeyDialog({ isOpen, onClose }: OpenAIKeyDialogProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  const validateApiKey = (key: string) => {
    if (!key.trim()) {
      setApiKeyError("La clave API es requerida");
      return false;
    }
    
    if (!key.startsWith("sk-")) {
      setApiKeyError("La clave API de OpenAI debe comenzar con 'sk-'");
      return false;
    }
    
    setApiKeyError(null);
    return true;
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
    if (apiKeyError) {
      validateApiKey(e.target.value);
    }
  };
  
  const handleSaveOpenAIKey = async () => {
    if (!validateApiKey(openaiApiKey)) {
      return;
    }
    
    setIsSavingApiKey(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay una sesión activa');
      }
      
      console.log("Calling edge function at:", `${SUPABASE_URL}/functions/v1/set-api-key`);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/set-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          key: 'OPENAI_API_KEY',
          value: openaiApiKey
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const responseBody = await response.text();
        console.error('Error response:', response.status);
        console.error('Response body:', responseBody);
        
        let errorMessage = 'Error al guardar la clave API';
        try {
          const errorJson = JSON.parse(responseBody);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      toast.success('Clave API guardada correctamente');
      onClose();
      setOpenaiApiKey("");
      setApiKeyError(null);
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la clave API');
    } finally {
      setIsSavingApiKey(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar API Key de OpenAI</DialogTitle>
          <DialogDescription>
            Ingrese su clave API de OpenAI para habilitar el análisis de IA en sus pronósticos de flujo de efectivo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key de OpenAI</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={handleApiKeyChange}
              className={apiKeyError ? "border-red-500" : ""}
            />
            {apiKeyError ? (
              <p className="text-xs text-red-500">{apiKeyError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                La clave API debe comenzar con "sk-". Se guardará de forma segura en la base de datos.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveOpenAIKey} disabled={isSavingApiKey}>
            {isSavingApiKey ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
