-- Add a field to mark accounts as global/master accounts
ALTER TABLE chart_of_accounts 
ADD COLUMN is_global BOOLEAN DEFAULT FALSE;

-- Mark existing accounts as global master accounts
UPDATE chart_of_accounts 
SET is_global = TRUE
WHERE user_id = '8f5ee279-2671-4bfe-bb59-a9e75598de46';

-- Create a special system user ID for global accounts (optional, for future global accounts)
-- We'll use NULL user_id for global accounts going forward
UPDATE chart_of_accounts 
SET user_id = NULL 
WHERE is_global = TRUE;

-- Update RLS policies to allow access to both global accounts and user-specific accounts
DROP POLICY IF EXISTS "User can manage own chart of accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "delete_accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "insert_accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "select_accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "update_accounts" ON chart_of_accounts;

-- New RLS policies for the global + personal account system
CREATE POLICY "Users can view global and own accounts" 
ON chart_of_accounts 
FOR SELECT 
USING (
  is_global = TRUE OR 
  user_id = auth.uid()
);

CREATE POLICY "Users can insert their own accounts" 
ON chart_of_accounts 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  is_global = FALSE
);

CREATE POLICY "Users can update their own accounts" 
ON chart_of_accounts 
FOR UPDATE 
USING (
  user_id = auth.uid() AND 
  is_global = FALSE
)
WITH CHECK (
  user_id = auth.uid() AND 
  is_global = FALSE
);

CREATE POLICY "Users can delete their own accounts" 
ON chart_of_accounts 
FOR DELETE 
USING (
  user_id = auth.uid() AND 
  is_global = FALSE
);

-- Index for better performance on global accounts queries
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_global ON chart_of_accounts(is_global) WHERE is_global = TRUE;