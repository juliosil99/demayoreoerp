/**
 * Utility functions for sales channel operations
 */

export type ChannelType = 'retail_own' | 'ecommerce_own' | 'retail_marketplace' | 'ecommerce_marketplace';

/**
 * Determines if a channel type is eligible for automatic reconciliation
 * Currently only retail_own channels support automatic reconciliation
 */
export function isAutoReconciliationEligible(channelType: ChannelType): boolean {
  return channelType === 'retail_own';
}

/**
 * Gets the display name for a channel type
 */
export function getChannelTypeDisplayName(channelType: ChannelType): string {
  const displayNames = {
    retail_own: 'Retail Propio',
    ecommerce_own: 'E-commerce Propio', 
    retail_marketplace: 'Retail Terceros',
    ecommerce_marketplace: 'E-commerce Terceros'
  };
  
  return displayNames[channelType] || channelType;
}

/**
 * Checks if a channel supports same-day payment processing
 * Retail own channels typically have same-day payment processing
 */
export function supportsSameDayPayment(channelType: ChannelType): boolean {
  return channelType === 'retail_own';
}