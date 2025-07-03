-- Add type_channel column to sales_channels table
ALTER TABLE public.sales_channels 
ADD COLUMN type_channel text;

-- Add constraint for valid channel types
ALTER TABLE public.sales_channels 
ADD CONSTRAINT sales_channels_type_channel_check 
CHECK (type_channel IN ('retail_own', 'ecommerce_own', 'retail_marketplace', 'ecommerce_marketplace'));

-- Update existing JM208 channel to retail_own
UPDATE public.sales_channels 
SET type_channel = 'retail_own' 
WHERE code = 'JM208';

-- Set default type for other existing channels (you can update these manually later)
UPDATE public.sales_channels 
SET type_channel = 'ecommerce_marketplace' 
WHERE type_channel IS NULL;