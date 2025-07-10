-- Add foreign key relationship between payment_adjustments and payments
ALTER TABLE payment_adjustments 
ADD CONSTRAINT fk_payment_adjustments_payment_id 
FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE;