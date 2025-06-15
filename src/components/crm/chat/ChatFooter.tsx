
import { QuickActions } from './QuickActions';
import { ChatInput } from './ChatInput';
import { InteractionFormData } from '@/types/crm';

interface ChatFooterProps {
  isReadOnly: boolean;
  isSending: boolean;
  companyName?: string;
  handleQuickAction: (type: 'call' | 'email' | 'meeting' | 'note' | 'task') => void;
  handleSendMessage: (data: Partial<InteractionFormData>) => void;
}

export const ChatFooter = ({ isReadOnly, isSending, companyName, handleQuickAction, handleSendMessage }: ChatFooterProps) => {
  if (isReadOnly) {
    return (
      <div className="flex-shrink-0 p-4 border-t text-center text-sm text-muted-foreground bg-gray-50">
        Esta conversación es de solo lectura.
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-t bg-white">
      <div className="px-4 pt-3">
        <QuickActions onQuickAction={handleQuickAction} />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        placeholder={`Escribe un mensaje${companyName ? ` para ${companyName}` : ''}...`}
      />
    </div>
  );
};
