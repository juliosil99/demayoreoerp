
import { useState } from 'react';
import { useCreateInteraction } from '@/hooks/useCrmInteractions';
import { InteractionFormData } from '@/types/crm';
import { toast } from 'sonner';

export const useChatOperations = (companyId?: string, contactId?: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const createInteraction = useCreateInteraction();

  const sendMessage = async (data: Partial<InteractionFormData>) => {
    if (!data.description?.trim()) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }

    setIsTyping(true);
    
    try {
      await createInteraction.mutateAsync({
        ...data,
        company_id: companyId,
        contact_id: contactId,
        type: data.type || 'note',
        subject: data.subject || data.description?.substring(0, 50) + '...',
        description: data.description,
        outcome: '',
        next_follow_up: '',
        interaction_date: new Date().toISOString().split('T')[0]
      });
      
      toast.success('Mensaje enviado');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (type: 'call' | 'email' | 'meeting' | 'note' | 'task') => {
    const quickMessages = {
      call: { subject: 'Llamada programada', description: 'Se ha programado una llamada telefónica' },
      email: { subject: 'Email enviado', description: 'Se ha enviado un email de seguimiento' },
      meeting: { subject: 'Reunión programada', description: 'Se ha programado una reunión' },
      note: { subject: 'Nota rápida', description: 'Nueva nota agregada al historial' },
      task: { subject: 'Tarea creada', description: 'Se ha creado una nueva tarea pendiente' }
    };

    const messageData = quickMessages[type];
    sendMessage({
      type,
      ...messageData,
      interaction_date: new Date().toISOString().split('T')[0]
    });
  };

  return {
    sendMessage,
    handleQuickAction,
    isTyping,
    isSending: createInteraction.isPending
  };
};
