-- Fix data type mismatch in get_sales_summary function
CREATE OR REPLACE FUNCTION public.get_sales_summary(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) RETURNS TABLE(
    total_revenue numeric,
    total_cost numeric,
    total_commission numeric,
    total_shipping numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    user_company_id uuid;
BEGIN
    -- Get user's company_id
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = p_user_id
    LIMIT 1;
    
    -- Return aggregated sales data with explicit casting
    RETURN QUERY
    SELECT 
        COALESCE(SUM(COALESCE(s.price, 0)), 0) as total_revenue,
        COALESCE(SUM(COALESCE(s.cost, 0)), 0) as total_cost,
        COALESCE(SUM(COALESCE(s.comission::numeric, 0)), 0) as total_commission,
        COALESCE(SUM(COALESCE(s.shipping::numeric, 0)), 0) as total_shipping
    FROM "Sales" s
    WHERE s.date >= p_start_date 
      AND s.date <= p_end_date
      AND s.company_id = user_company_id;
END;
$$;