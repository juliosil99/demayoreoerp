-- Create payment_adjustments table for tracking commissions and shipping costs
CREATE TABLE IF NOT EXISTS public.payment_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('commission', 'shipping', 'other')),
  amount NUMERIC NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_adjustments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own payment adjustments"
ON public.payment_adjustments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_payment_adjustments_payment_id ON public.payment_adjustments(payment_id);
CREATE INDEX idx_payment_adjustments_user_id ON public.payment_adjustments(user_id);