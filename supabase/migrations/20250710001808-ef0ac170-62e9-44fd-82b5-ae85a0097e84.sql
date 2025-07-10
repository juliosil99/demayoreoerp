-- Fix get_state_distribution function to filter by user_id to prevent data leaking between users

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_state_distribution(date, date);

-- Create the updated function with user_id parameter
CREATE OR REPLACE FUNCTION public.get_state_distribution(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS TABLE(
  state text,
  total_records bigint,
  total_revenue numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE("Sales"."state", 'Sin Estado') as state,
    COUNT(*)::bigint as total_records,
    COALESCE(SUM("Sales"."price"), 0)::numeric as total_revenue
  FROM "Sales"
  WHERE 
    -- Filter by user_id to ensure data isolation
    "Sales"."user_id" = p_user_id
    -- Apply date filters if provided
    AND (p_start_date IS NULL OR "Sales"."date" >= p_start_date)
    AND (p_end_date IS NULL OR "Sales"."date" <= p_end_date)
  GROUP BY "Sales"."state"
  ORDER BY total_revenue DESC, total_records DESC;
END;
$$;