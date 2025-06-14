
import { Interaction } from '@/types/crm';

interface MessageContentProps {
  interaction: Interaction;
  isOutgoing: boolean;
  subject: string | undefined;
}

export const MessageContent = ({ interaction, isOutgoing, subject }: MessageContentProps) => {
  return (
    <>
      {subject && (
        <h4 className={`font-medium text-sm mb-1 ${
          isOutgoing ? 'text-white' : 'text-gray-900'
        }`} title={subject}>
          {subject}
        </h4>
      )}
      
      {interaction.description && (
        <p className={`text-sm mb-2 ${
          isOutgoing ? 'text-blue-50' : 'text-gray-600'
        }`}>
          {interaction.description}
        </p>
      )}
      
      {interaction.outcome && (
        <div className={`text-sm ${
          isOutgoing ? 'text-blue-50' : 'text-gray-600'
        }`}>
          <span className="font-medium">Resultado: </span>
          <span>{interaction.outcome}</span>
        </div>
      )}
    </>
  );
};
