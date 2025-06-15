
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Building2, User, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  onBack?: () => void;
  contactName?: string;
  companyName?: string;
}

export const ChatHeader = ({ onBack, contactName, companyName }: ChatHeaderProps) => {
  return (
    <CardHeader className="border-b bg-gray-50 flex-shrink-0">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-1 text-lg truncate">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden shrink-0 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {onBack ? (
            <span className="truncate">{contactName || companyName || 'Chat'}</span>
          ) : (
            <>
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="ml-1">Chat</span>
            </>
          )}
        </CardTitle>
        <div className="hidden md:flex items-center gap-2">
          {companyName && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {companyName}
            </Badge>
          )}
          {contactName && (
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {contactName}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
