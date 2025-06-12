
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  ShoppingCart,
  Package,
  MessageSquare,
  Users
} from 'lucide-react';

interface ChannelBadgeProps {
  type: string;
  metadata?: Record<string, any>;
}

export const ChannelBadge = ({ type, metadata }: ChannelBadgeProps) => {
  const getChannelInfo = (type: string, metadata?: any) => {
    switch (type) {
      case 'mercadolibre_question':
        return { 
          label: 'MercadoLibre', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Package
        };
      case 'email':
        return { 
          label: 'Email', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Mail
        };
      case 'call':
        return { 
          label: 'Llamada', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Phone
        };
      case 'meeting':
        return { 
          label: 'Reunión', 
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Calendar
        };
      case 'note':
        return { 
          label: 'Nota', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FileText
        };
      case 'task':
        return { 
          label: 'Tarea', 
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Users
        };
      case 'sale':
        return { 
          label: 'Venta', 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: ShoppingCart
        };
      case 'whatsapp':
        return { 
          label: 'WhatsApp', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: MessageSquare
        };
      case 'instagram':
        return { 
          label: 'Instagram', 
          color: 'bg-pink-100 text-pink-800 border-pink-200',
          icon: MessageSquare
        };
      case 'tiktok':
        return { 
          label: 'TikTok', 
          color: 'bg-black text-white border-black',
          icon: MessageSquare
        };
      default:
        return { 
          label: type.charAt(0).toUpperCase() + type.slice(1), 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: MessageSquare
        };
    }
  };

  const channelInfo = getChannelInfo(type, metadata);
  const Icon = channelInfo.icon;

  return (
    <Badge variant="outline" className={`text-xs ${channelInfo.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {channelInfo.label}
    </Badge>
  );
};
