
import { Interaction } from '@/types/crm';

interface MessageMetadataProps {
  interaction: Interaction;
  isOutgoing: boolean;
  isMLQuestion: boolean;
  isMLAnswer: boolean;
}

export const MessageMetadata = ({ interaction, isOutgoing, isMLQuestion, isMLAnswer }: MessageMetadataProps) => {
  if (!interaction.metadata || Object.keys(interaction.metadata).length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 p-2 rounded text-xs ${
      isOutgoing 
        ? 'bg-blue-400 text-blue-50' 
        : isMLQuestion
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-50 text-gray-600'
    }`}>
      {isMLQuestion && (
        <>
          {interaction.metadata.product_title && (
            <div className="mb-1">
              <span className="font-medium">Producto:</span> {interaction.metadata.product_title}
            </div>
          )}
          {interaction.metadata.product_price && (
            <div className="mb-1">
              <span className="font-medium">Precio:</span> ${interaction.metadata.product_price}
            </div>
          )}
        </>
      )}
      
      {isMLAnswer && interaction.metadata.response_time_seconds && (
          <div className="text-xs opacity-75">
            Respondido en {interaction.metadata.response_time_seconds}s
          </div>
      )}
      
      {!isMLQuestion && !isMLAnswer && (
        <>
          {interaction.metadata.amount && (
            <div>Monto: ${interaction.metadata.amount}</div>
          )}
          {interaction.metadata.order_number && (
            <div>Orden: {interaction.metadata.order_number}</div>
          )}
          {interaction.metadata.product_name && (
            <div>Producto: {interaction.metadata.product_name}</div>
          )}
        </>
      )}
    </div>
  );
};
