
import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Paperclip } from 'lucide-react';
import { InteractionFormData } from '@/types/crm';

interface ChatInputProps {
  onSendMessage: (data: Partial<InteractionFormData>) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, disabled, placeholder = "Escribe tu mensaje..." }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<InteractionFormData['type']>('note');

  const handleSend = () => {
    if (!message.trim()) return;

    onSendMessage({
      type: messageType,
      subject: message.length > 50 ? message.substring(0, 50) + '...' : message,
      description: message,
      interaction_date: new Date().toISOString().split('T')[0]
    });

    setMessage('');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const interactionTypes: Array<{ value: InteractionFormData['type'], label: string }> = [
    { value: 'note', label: '📝 Nota' },
    { value: 'call', label: '📞 Llamada' },
    { value: 'email', label: '📧 Email' },
    { value: 'meeting', label: '🤝 Reunión' },
    { value: 'task', label: '✅ Tarea' },
  ];

  return (
    <div className="border-t bg-white p-4">
      <div className="flex gap-2 mb-3">
        <Select
          value={messageType}
          onValueChange={(value: InteractionFormData['type']) => setMessageType(value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {interactionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[40px] max-h-32 resize-none"
            disabled={disabled}
          />
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
