
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckSquare, 
  ShoppingCart,
  Receipt,
  CreditCard,
  MessageSquare,
  Send,
  HelpCircle,
  ShieldAlert,
  Shield,
  Bot,
  Wand2,
  UserCheck
} from 'lucide-react';

export const getInteractionIcon = (type: string) => {
  switch (type) {
    case 'email': return Mail;
    case 'call': return Phone;
    case 'meeting': return Calendar;
    case 'note': return FileText;
    case 'task': return CheckSquare;
    case 'sale': return ShoppingCart;
    case 'invoice': return Receipt;
    case 'payment': return CreditCard;
    case 'mercadolibre_question': return MessageSquare;
    case 'mercadolibre_answer': return Send;
    case 'mercadolibre_purchase_inquiry': return HelpCircle;
    case 'mercadolibre_claim_customer': return ShieldAlert;
    case 'mercadolibre_claim_ml': return Shield;
    case 'auto_response_pending': return Bot;
    case 'auto_response_sent': return Wand2;
    case 'escalated_to_human': return UserCheck;
    default: return FileText;
  }
};

export const getInteractionColor = (type: string) => {
  switch (type) {
    case 'email': return 'text-blue-600 bg-blue-50';
    case 'call': return 'text-green-600 bg-green-50';
    case 'meeting': return 'text-purple-600 bg-purple-50';
    case 'note': return 'text-gray-600 bg-gray-50';
    case 'task': return 'text-orange-600 bg-orange-50';
    case 'sale': return 'text-emerald-600 bg-emerald-50';
    case 'invoice': return 'text-indigo-600 bg-indigo-50';
    case 'payment': return 'text-green-600 bg-green-50';
    case 'mercadolibre_question': return 'text-yellow-600 bg-yellow-50';
    case 'mercadolibre_answer': return 'text-blue-600 bg-blue-50';
    case 'mercadolibre_purchase_inquiry': return 'text-cyan-600 bg-cyan-50';
    case 'mercadolibre_claim_customer': return 'text-red-600 bg-red-50';
    case 'mercadolibre_claim_ml': return 'text-orange-600 bg-orange-50';
    case 'auto_response_pending': return 'text-gray-600 bg-gray-50';
    case 'auto_response_sent': return 'text-indigo-600 bg-indigo-50';
    case 'escalated_to_human': return 'text-pink-600 bg-pink-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'email': return 'Email';
    case 'call': return 'Llamada';
    case 'meeting': return 'Reunión';
    case 'note': return 'Nota';
    case 'task': return 'Tarea';
    case 'sale': return 'Venta';
    case 'invoice': return 'Factura';
    case 'payment': return 'Pago';
    case 'mercadolibre_question': return 'Pregunta ML';
    case 'mercadolibre_answer': return 'Respuesta ML';
    case 'mercadolibre_purchase_inquiry': return 'Consulta Compra ML';
    case 'mercadolibre_claim_customer': return 'Reclamo Cliente ML';
    case 'mercadolibre_claim_ml': return 'Mensaje Reclamo ML';
    case 'auto_response_pending': return 'Procesando Auto-Respuesta';
    case 'auto_response_sent': return 'Respuesta Automática';
    case 'escalated_to_human': return 'Escalado a Humano';
    default: return type;
  }
};
