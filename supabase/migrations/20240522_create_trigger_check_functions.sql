
-- Create a function to list triggers related to reconciliation process
CREATE OR REPLACE FUNCTION public.list_triggers_for_reconciliation()
RETURNS TABLE (
  trigger_name text,
  event_manipulation text, 
  event_object_schema text,
  event_object_table text,
  action_statement text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    trigger.trigger_name,
    trigger.event_manipulation,
    trigger.event_object_schema,
    trigger.event_object_table,
    trigger.action_statement
  FROM 
    information_schema.triggers AS trigger
  WHERE 
    trigger.event_object_table IN ('Sales', 'payments')
    AND trigger.trigger_name LIKE '%reconcil%'
    OR trigger.action_statement LIKE '%reconcil%';
END;
$$;

-- Create a general function to list triggers for any table
CREATE OR REPLACE FUNCTION public.list_triggers_for_table(table_name text)
RETURNS TABLE (
  trigger_name text,
  event_manipulation text, 
  event_object_schema text,
  event_object_table text,
  action_statement text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    trigger.trigger_name,
    trigger.event_manipulation,
    trigger.event_object_schema,
    trigger.event_object_table,
    trigger.action_statement
  FROM 
    information_schema.triggers AS trigger
  WHERE 
    trigger.event_object_table = table_name;
END;
$$;
